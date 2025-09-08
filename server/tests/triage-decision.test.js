import request from "supertest";
import app from "../index.js";
import { getToken, setConfig } from "./util.js";

it("auto-closes when >= threshold", async () => {
  const token = await getToken(app, { role:"admin" });
  await setConfig(app, token, { autoCloseEnabled:true, confidenceThreshold:0.2 });

  const user = await getToken(app); // normal user
  const r = await request(app).post("/api/tickets")
    .set("Authorization", `Bearer ${user}`)
    .send({ title:"App 500 error", description:"stack trace on login" });
  expect(["resolved","waiting_human"]).toContain(r.body.status);
  // With low threshold the stub's ~0.9 should resolve
  expect(r.body.status).toBe("resolved");
});
