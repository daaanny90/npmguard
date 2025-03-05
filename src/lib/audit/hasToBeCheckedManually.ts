import { parseGitHubRepoUrl } from "../parseGithub.js";

export function hasToBeCheckedManually(npmInfo: {repository: string}): boolean {
if (!npmInfo.repository) {
    console.error(`\n ❌ npm info does not contain repository URL. Skip.`);
    return true 
  }

  if (!npmInfo) {
    console.error(`\n ❌ npm info does not contain repository URL. Please check the package manually.`);
    return true;
  }

  const apiUrl = parseGitHubRepoUrl(npmInfo.repository);

  if (!apiUrl) {
    console.error(`\n ❌ Invalid repository URL. Skip.`);
    return true
  }

  return false
}
