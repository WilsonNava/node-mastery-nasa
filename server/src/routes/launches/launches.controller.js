const {
  getAllLaunches: getLaunches,
  scheduleNewLaunch,
  existLaunchById,
  abortLaunchById,
} = require("../../models/launches.model");
const { getPagination } = require("../../services/query");

async function getAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getLaunches({ skip, limit });
  return res.status(200).send(launches);
}

async function addLaunch(req, res) {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).send({
      error: "All fields are required",
    });
  }
  launch.launchDate = new Date(launch.launchDate);
  if (launch.launchDate.toString() === "Invalid Date") {
    return res.status(400).send({
      error: "Invalid date",
    });
  }

  try {
    const newLaunch = await scheduleNewLaunch(launch);
    return res.status(201).send(newLaunch);
  } catch (error) {
    console.log("ERRR", error);
    return res.status(404).send({
      message: "there was an error",
      error,
    });
  }
}

async function deleteLaunch(req, res) {
  const { id } = req.params;
  const launch = existLaunchById(id);
  if (!launch) {
    return res.status(404).send({
      error: "Data not found",
    });
  }

  const aborted = await abortLaunchById(id);

  if (!aborted) {
    return res.status(404).send({ error: "Launch not aborted" });
  }

  return res.status(200).send({
    sucess: true,
  });
}

module.exports = {
  getAllLaunches,
  addLaunch,
  deleteLaunch,
};
