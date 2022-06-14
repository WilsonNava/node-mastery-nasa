const express = require("express");
const { getAllLaunches, addLaunch, deleteLaunch } = require("./launches.controller");

const launchesRouter = express.Router();

launchesRouter.get("/", getAllLaunches);
launchesRouter.post("/", addLaunch);
launchesRouter.delete("/:id", deleteLaunch)

module.exports = launchesRouter;
