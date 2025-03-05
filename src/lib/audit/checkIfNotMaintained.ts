import puppeteer from 'puppeteer';
import { Issue } from '../../types/Issue.type.js';
import { monthsSinceDate } from '../monthSinceDate.js';
import { parseGitHubRepoUrl } from '../parseGithub.js';
import { text } from 'stream/consumers';

export async function checkIfNotMaintained(repoUrl: string): Promise<Issue | null> {
  const url = parseGitHubRepoUrl(repoUrl)
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://github.com/${url.username}/${url.repo}`)

  const lastCommitSelector = 'div[data-testid="latest-commit-details"] relative-time';

  await page.waitForSelector(lastCommitSelector);
  const dateLastCommit = await page.$eval(lastCommitSelector, el => el.textContent);

  const lastCommitLimitDate = new Date();
  lastCommitLimitDate.setMonth(lastCommitLimitDate.getMonth() - 12);
  const lastCommitOlderThan12Months = new Date(dateLastCommit) < lastCommitLimitDate

  browser.close();

  if (lastCommitOlderThan12Months) {
    return {
      type: 'outdated',
      details: `Repository not actively maintained, last commit ${monthsSinceDate(new Date(dateLastCommit))} months ago (${new Date(dateLastCommit).toISOString().split('T')[0]})`
    } 
  }

  return null;
}
