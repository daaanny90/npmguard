import { monthsSinceDate } from "../monthSinceDate.js";
export function checkOldRelease(npmInfo, cutoffDate) {
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
