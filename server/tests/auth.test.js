import request from "supertest";
import app from "../index.js"; // export the express app in index.js for testing
describe("auth", () => {
  it("register/login -> token", async () => {
    const email = `u${Date.now()}@x.com`;
    await request(app).post("/api/auth/register").send({ name:"U", email, password:"p@ss" }).expect(200);
    const r = await request(app).post("/api/auth/login").send({ email, password:"p@ss" });
    expect(r.status).toBe(200);
    expect(r.body.token).toBeDefined();
  });
});
