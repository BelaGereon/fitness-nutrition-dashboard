import type { WeeksExportService } from "../../data/weeksExport";
import {
  createBrowserFileDownloader,
  createJsonWeeksExportFormatter,
  createWeeksExportService,
} from "../../data/weeksExport";

export const createDefaultWeeksExportService = (): WeeksExportService => {
  return createWeeksExportService({
    formatter: createJsonWeeksExportFormatter(),
    downloader: createBrowserFileDownloader({
      document: window.document,
      url: window.URL,
    }),
  });
};
