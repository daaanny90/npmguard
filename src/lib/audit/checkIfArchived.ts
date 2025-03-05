import puppeteer from "puppeteer";
import { parseGitHubRepoUrl } from "../parseGithub.js";
import { Issue } from "../../types/Issue.type.js";
import { execSync } from 'child_process';

export async function checkIfArchived(npmInfo: {repository: string}): Promise<Issue | null> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  if (!npmInfo || !npmInfo.hasOwnProperty('repository')) {
    console.error(`\n ❌ npm info does not contain repository URL. Please check the package manually.`);
    return null;
  }

  const apiUrl = parseGitHubRepoUrl(npmInfo.repository);

  const repoUrl = `https://github.com/${apiUrl.username}/${apiUrl.repo}`

  await page.goto(repoUrl)
  await page.setViewport({ width: 1080, height: 1024 });
  const command = `curl -s "${repoUrl}"`;
  const response = execSync(command).toString();
  const archived = /This repository has been archived by the owner|It is now read-only.|Public archive/.test(response);

  browser.close();

  if (archived) {
    return {
      type: 'archived_repo',
      details: `Archived repository (${repoUrl})`
    }
  }

  return null;
}
