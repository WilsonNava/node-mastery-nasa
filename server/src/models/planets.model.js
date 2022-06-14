const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");

const Planets = require("./planets.mongo");

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler-data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          await savePlanet(data);
        }
      })
      .on("error", (err) => {
        reject(err);
      })
      .on("end", async () => {
        const planets = await getAllPlanets();
        console.log(planets.length, "planets found");
        resolve();
      });
  });
}

function getAllPlanets() {
  return Planets.find({}, {
    "_id": 0,
    keplerName: 1 //take
  });
}

async function savePlanet(data) {
  // const exist = await Planets.findOne({
  //   keplerName: data.kepler_name,
  // });

  // if (!exist) {
  //  return   Planets.create({
  //     keplerName: data.kepler_name,
  //   });
  // }

  //better way using upsert

  try {
    await Planets.updateOne(
      {
        keplerName: data.kepler_name,
      },
      { keplerName: data.kepler_name },
      { upsert: true }
    );
  } catch (error) {
    console.log("Error saving planet", error);
  }
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
