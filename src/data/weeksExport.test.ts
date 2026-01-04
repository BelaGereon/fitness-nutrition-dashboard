// data/weeksExport.test.ts
import { describe, expect, it, vi } from "vitest";
import type { WeekEntry } from "../domain/week";
import {
  createBrowserFileDownloader,
  createJsonWeeksExportFormatter,
  createWeeksExportService,
} from "./weeksExport";

describe("weeksExport - formatter", () => {
  it("formats a versioned json payload with exportedAt and weeks", () => {
    const formatter = createJsonWeeksExportFormatter();

    const weeks: WeekEntry[] = [
      {
        id: "w1",
        weekOf: "2026-01-05",
        days: {
          mon: {},
          tue: {},
          wed: {},
          thu: {},
          fri: {},
          sat: {},
          sun: {},
        },
      },
    ];

    const now = new Date("2026-01-07T10:00:00.000Z");

    const file = formatter.format(weeks, now);
    expect(file.mimeType).toBe("application/json");
    expect(file.filename).toBe("fitness-dashboard-weeks-2026-01-07.json");

    const parsed = JSON.parse(file.content);
    expect(parsed.version).toBe(1);
    expect(parsed.exportedAt).toBe("2026-01-07T10:00:00.000Z");
    expect(parsed.weeks).toEqual(weeks);
  });
});

describe("weeksExport - service", () => {
  it("delegates to downloader with formatted file", () => {
    const formatter = createJsonWeeksExportFormatter();
    const downloader = { download: vi.fn() };
    const service = createWeeksExportService({ formatter, downloader });

    const weeks: WeekEntry[] = [
      {
        id: "w1",
        weekOf: "2026-01-05",
        days: {
          mon: {},
          tue: {},
          wed: {},
          thu: {},
          fri: {},
          sat: {},
          sun: {},
        },
      },
    ];

    const now = new Date("2026-01-07T10:00:00.000Z");

    service.exportWeeks(weeks, now);

    expect(downloader.download).toHaveBeenCalledTimes(1);
    const fileArg = downloader.download.mock.calls[0][0];
    expect(fileArg.filename).toBe("fitness-dashboard-weeks-2026-01-07.json");
  });
});

describe("weeksExport - browser downloader", () => {
  it("creates an anchor download and revokes the object url", () => {
    const createObjectURL = vi.fn(() => "blob:123");
    const revokeObjectURL = vi.fn();

    const click = vi.fn();
    const remove = vi.fn();

    const a = { click, remove, href: "", download: "" };

    const documentStub = {
      createElement: vi.fn(() => a),
      body: { appendChild: vi.fn() },
    };

    const downloader = createBrowserFileDownloader({
      document: documentStub as unknown as Document,
      url: { createObjectURL, revokeObjectURL },
    });

    downloader.download({
      filename: "x.json",
      mimeType: "application/json",
      content: "{}",
    });

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(documentStub.createElement).toHaveBeenCalledWith("a");
    expect(documentStub.body.appendChild).toHaveBeenCalledWith(a);
    expect(a.download).toBe("x.json");
    expect(a.href).toBe("blob:123");
    expect(click).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:123");
  });
});
