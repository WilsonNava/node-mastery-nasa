const Launches = require("./launches.mongo");
const Planets = require("./planets.mongo");
const axios = require("axios");

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
  const response = await axios.post(SPACEX_API_URL, {
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("Error downloading launches data");
    throw new error("Error downloading launches data");
  }

  const launchDocs = response.data.docs;

  launchDocs.forEach(async (launchDoc) => {
    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc.name,
      rocket: launchDoc.rocket.name,
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc.upcoming,
      sucess: launchDoc.sucess,
      customers: launchDoc.payloads.flatMap(({ customers }) => customers),
    };
    await saveLaunch(launch);
  });
}

async function loadLaunchesData() {
  console.log("getting launch data");

  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("Launches data already were loaded!");
    return;
  }

  await populateLaunches();
}

async function scheduleNewLaunch(launch) {
  const planet = await Planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error("Target doesn't exist");
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = {
    ...launch,
    sucess: true,
    upcoming: true,
    customer: ["NASA", "AYW"],
    flightNumber: newFlightNumber,
  };
  console.log(newLaunch);
  await saveLaunch(newLaunch);

  return newLaunch;
}

async function findLaunch(filter) {
  return await Launches.findOne(filter);
}

async function existLaunchById(id) {
  return await findLaunch({
    flightNumber: id,
  });
}

async function abortLaunchById(id) {
  const aborted = await Launches.updateOne(
    {
      flightNumber: id,
    },
    {
      upcoming: false,
      sucess: false,
    }
  );

  return aborted.modifiedCount === 1;
}

async function saveLaunch(launch) {
  await Launches.updateOne(
    {
      flightNumber: launch.latestFlightNumber,
    },
    launch,
    { upsert: true }
  );
}

async function getAllLaunches({ skip, limit }) {
  // PAGINATION, SORTING
  return await Launches.find({})
    .sort({
      flightNumber: 1,
    })
    .skip(skip)
    .limit(limit);
}

async function getLatestFlightNumber() {
  const latestLaunh = await Launches.findOne().sort("-flightNumber");

  return latestLaunh?.flightNumber || 0;
}

module.exports = {
  loadLaunchesData,
  getAllLaunches,
  existLaunchById,
  abortLaunchById,
  scheduleNewLaunch,
};
