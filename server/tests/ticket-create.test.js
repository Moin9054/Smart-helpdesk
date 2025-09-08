import request from "supertest";
import app from "../index.js";
import { getToken } from "./util.js";

it("creates a ticket", async () => {
  const token = await getToken(app);
  const r = await request(app).post("/api/tickets")
    .set("Authorization", `Bearer ${token}`)
    .send({ title:"Refund", description:"double charge" });
  expect(r.status).toBe(201);
  expect(r.body._id || r.body.id).toBeDefined();
});
