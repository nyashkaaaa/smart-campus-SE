// Runs before every test file.
// Adds DOM matchers such as toBeInTheDocument() and toBeDisabled() to expect().
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmount the rendered App after each test so tests do not affect each other.
afterEach(() => {
  cleanup();
});
