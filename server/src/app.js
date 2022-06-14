const express = require("express");
var cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const apiV1 = require("./routes/api")

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3001",
  })
);

app.use(morgan("combined"));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/v1", apiV1);

app.use("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;
