import type { WeekEntry } from "../domain/week";

export type ExportFile = {
  filename: string;
  mimeType: string;
  content: string;
};

export type WeeksExportFormatter = {
  format(weeks: WeekEntry[], now: Date): ExportFile;
};

export type FileDownloader = {
  download(file: ExportFile): void;
};

export type WeeksExportService = {
  exportWeeks(weeks: WeekEntry[], now: Date): void;
};

const toISODate = (d: Date): string => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0); // avoid DST weirdness
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export function createJsonWeeksExportFormatter(): WeeksExportFormatter {
  return {
    format(weeks: WeekEntry[], now: Date): ExportFile {
      const payload = {
        version: 1,
        exportedAt: now.toISOString(),
        weeks,
      };

      return {
        filename: `fitness-dashboard-weeks-${toISODate(now)}.json`,
        mimeType: "application/json",
        content: JSON.stringify(payload, null, 2),
      };
    },
  };
}

export function createBrowserFileDownloader(deps: {
  document: Document;
  url: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;
}): FileDownloader {
  return {
    download(file: ExportFile) {
      const blob = new Blob([file.content], { type: file.mimeType });
      const href = deps.url.createObjectURL(blob);

      const a = deps.document.createElement("a");
      a.href = href;
      a.download = file.filename;

      // keep it robust across browsers
      deps.document.body.appendChild(a);
      a.click();
      a.remove();

      deps.url.revokeObjectURL(href);
    },
  };
}

export function createWeeksExportService(args: {
  formatter: WeeksExportFormatter;
  downloader: FileDownloader;
}): WeeksExportService {
  return {
    exportWeeks(weeks: WeekEntry[], now: Date) {
      const file = args.formatter.format(weeks, now);
      args.downloader.download(file);
    },
  };
}
