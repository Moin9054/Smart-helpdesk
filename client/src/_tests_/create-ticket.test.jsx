import { render, screen } from "@testing-library/react";
import UserDashboard from "../pages/UserDashboard.jsx";
import userEvent from "@testing-library/user-event";
import { vi, it, expect } from "vitest";
import api from "../api";

// mock api
vi.mock("../api", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: { _id:"1", title:"T", description:"D", status:"open" }})
  }
}));

it("creates ticket and updates list", async () => {
  render(<UserDashboard />);
  await userEvent.type(screen.getByPlaceholderText(/title/i), "T");
  await userEvent.type(screen.getByPlaceholderText(/description/i), "D");
  await userEvent.click(screen.getByRole("button", { name:/create/i }));
  expect(await screen.findByText(/T —/i)).toBeTruthy();
});
