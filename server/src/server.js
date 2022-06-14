require("dotenv").config();

const http = require("http");
const app = require("./app");
const mongoService = require("./services/mongo");

const { loadPlanetsData } = require("./models/planets.model");
const { loadLaunchesData } = require("./models/launches.model");

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function initServer() {
  try {
    await mongoService.connect();

    await loadPlanetsData();
    await loadLaunchesData();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

initServer();
