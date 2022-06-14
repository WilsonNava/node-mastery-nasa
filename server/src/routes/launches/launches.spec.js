const request = require("supertest");
const app = require("../../app");
const mongoService = require("../../services/mongo");
const { loadPlanetsData } = require("../../models/planets.model");

describe("Launches API", () => {
  beforeAll(async () => {
    await mongoService.connect();
    await loadPlanetsData();
  });

  afterAll(async () => {
    await mongoService.disconnect();
  });

  describe("Test GET /v1/launches", () => {
    it("Should respond with 200 status", async () => {
      const response = await request(app).get("/v1/launches");

      expect(response.statusCode).toBe(200);
    });
  });

  describe("Test POST /launch", () => {
    it("Should respond with 200 status", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send({
          mission: "Mission 1",
          rocket: "Rocket 1",
          launchDate: "1992-06-15T04:00:00.000Z",
          target: "Kepler-1410 b",
        })
        .expect("Content-Type", /json/)
        .expect(201);

      expect(response.body).toMatchObject({
        mission: "Mission 1",
        rocket: "Rocket 1",
        launchDate: "1992-06-15T04:00:00.000Z",
        target: "Kepler-1410 b",
      });
    });
    it("Should catch missing properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send({
          mission: "Mission 1",
          rocket: "Rocket 1",
          launchDate: "1992-06-15T04:00:00.000Z",
        })
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "All fields are required",
      });
    });
    it("Should catch invalid dates", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send({
          mission: "Mission 1",
          rocket: "Rocket 1",
          launchDate: "I AM NOT A DATE",
          target: "Kepler-1410 b",
        })
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Invalid date",
      });
    });
  });
});
