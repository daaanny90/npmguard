import { Issue } from "../../types/Issue.type.js";
import { monthsSinceDate } from "../monthSinceDate.js";

export function checkOldRelease(
  npmInfo: {time: Record<string, string>, 'dist-tags': Record<string, string>},
  cutoffDate: Date 
): Issue | null {
  if (npmInfo.time && npmInfo['dist-tags']) {
    const latestVersion = npmInfo['dist-tags'].latest;
    const latestReleaseDate = new Date(npmInfo.time[latestVersion]);

    if (latestReleaseDate < cutoffDate) {
      return {
        type: 'old_release',
        details: `Last release older than ${monthsSinceDate(latestReleaseDate)} months (${latestReleaseDate.toISOString().split('T')[0]})`
      };
    }
    return null;
  }

  return null;
}
