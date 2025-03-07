import { execSync } from 'child_process';
import { parseGitHubRepoUrl } from "../parseGithub.js";
export async function checkIfArchived(npmInfo) {
    if (!npmInfo || !npmInfo.hasOwnProperty('repository')) {
        console.error(`\n ❌ npm info does not contain repository URL. Please check the package manually.`);
        return null;
    }
    const apiUrl = parseGitHubRepoUrl(npmInfo.repository);
    const repoUrl = `https://github.com/${apiUrl.username}/${apiUrl.repo}`;
    try {
        const command = `curl -s "${repoUrl}"`;
        const html = execSync(command).toString();
        const archived = isRepoArchived(html);
        if (archived) {
            return {
                type: 'archived_repo',
                details: `Archived repository (${repoUrl})`
            };
        }
        return null;
    }
    catch (error) {
        console.error(`\n ❌ Error checking if repository is archived: ${error}`);
        return null;
    }
}
function isRepoArchived(html) {
    return /This repository has been archived by the owner|It is now read-only.|Public archive/.test(html);
}
