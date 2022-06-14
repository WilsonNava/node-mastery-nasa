const { getAllPlanets } = require("../../models/planets.model");

const getPlanets = async (req, res) => {
  res.status(200).send(await getAllPlanets());
};

module.exports = {
  getPlanets,
};
