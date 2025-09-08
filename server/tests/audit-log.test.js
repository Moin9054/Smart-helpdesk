import request from "supertest";
import app from "../index.js";
import { getToken } from "./util.js";

it("audit timeline ordered with same traceId", async () => {
  const token = await getToken(app);
  const t = await request(app).post("/api/tickets")
    .set("Authorization", `Bearer ${token}`)
    .send({ title:"Where is my order?", description:"delivery delayed" });

  const a = await request(app).get(`/api/tickets/${t.body._id}/audit`)
    .set("Authorization", `Bearer ${token}`);
  expect(a.status).toBe(200);
  const arr = a.body || [];
  const trace = arr[0]?.traceId;
  expect(arr.every(e => e.traceId === trace)).toBe(true);
  // basic order sanity
  const actions = arr.map(e => e.action);
  expect(actions[0]).toBe("AGENT_CLASSIFIED");
});
