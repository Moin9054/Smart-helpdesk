import { render, screen } from "@testing-library/react";
import Login from "../pages/login.jsx";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";

describe("Login form", () => {
  it("validates required fields", async () => {
    render(<Login />);
    await userEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });
});
