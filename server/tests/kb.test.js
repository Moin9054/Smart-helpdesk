import request from "supertest";
import app from "../index.js";
import { getToken } from "./util.js";

it("kb search returns published articles", async () => {
  const token = await getToken(app);
  const r = await request(app).get("/api/kb").set("Authorization", `Bearer ${token}`).query({ query:"error" });
  expect(r.status).toBe(200);
  expect(Array.isArray(r.body)).toBe(true);
});
