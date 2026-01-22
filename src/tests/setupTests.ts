import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

/**
 * ApexCharts uses browser APIs that JSDOM doesn't implement well
 * (e.g. layout/measurements, ResizeObserver).
 *
 * For unit/component tests, we mock the chart so it doesn't execute
 * those internals and break unrelated tests.
 */
vi.mock("react-apexcharts", () => ({
  __esModule: true,
  default: () =>
    React.createElement("div", { "data-testid": "apexchart-mock" }),
}));
