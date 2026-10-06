import React from "react";
import { TextEncoder, TextDecoder } from "util";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
const { MemoryRouter, Routes, Route } = require("react-router-dom");
const Signup = require("../landing_page/signup/Signup").default;
jest.mock("axios");

function setup() {
  render(<MemoryRouter initialEntries={["/signup"]}><Routes>
    <Route path="/signup" element={<Signup />} />
    <Route path="/login" element={<Signup key="login" login />} />
  </Routes></MemoryRouter>);
  fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Demo Trader" } });
  fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "demo@example.com" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "demo-passphrase" } });
  fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "demo-passphrase" } });
}

beforeEach(() => jest.clearAllMocks());

test("does not submit mismatched passwords", () => {
  setup();
  fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "different-password" } });
  fireEvent.click(screen.getByRole("button", { name: "Create account" }));
  expect(screen.getByRole("alert")).toHaveTextContent("don't match");
  expect(axios.post).not.toHaveBeenCalled();
});

test("creates the account and shows login with a success message", async () => {
  axios.post.mockResolvedValueOnce({ data: {} });
  setup();
  fireEvent.click(screen.getByRole("button", { name: "Create account" }));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Your account is ready"));
  expect(axios.post).toHaveBeenCalledWith("http://localhost:3002/auth/signup", {
    name: "Demo Trader", email: "demo@example.com", password: "demo-passphrase",
  }, expect.objectContaining({ withCredentials: true }));
  expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
});

test("shows a duplicate email error and permits retry", async () => {
  axios.post.mockRejectedValueOnce({ response: { data: { message: "An account with this email already exists. Please log in." } } });
  setup();
  fireEvent.click(screen.getByRole("button", { name: "Create account" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("already exists"));
  expect(screen.getByRole("button", { name: "Create account" })).toBeEnabled();
});
