import https from 'https';
import { monthsSinceDate } from '../monthSinceDate.js';
import { parseGitHubRepoUrl } from '../parseGithub.js';
export async function checkIfNotMaintained(repoUrl) {
    try {
        const url = parseGitHubRepoUrl(repoUrl);
        let dateLastCommit = await fetchLastCommitDate(url.username, url.repo);
        if (!dateLastCommit) {
            const githubUrl = `https://github.com/${url.username}/${url.repo}`;
            try {
                const html = await followRedirects(githubUrl);
                dateLastCommit = extractLastCommitDate(html);
            }
            catch (htmlError) {
                console.error(`\n ❌ Failed to fetch or parse HTML: ${htmlError}`);
            }
        }
        if (!dateLastCommit) {
            console.error(`\n ❌ Could not find last commit date for repository: ${url.username}/${url.repo}`);
            return null;
        }
        const lastCommitLimitDate = new Date();
        lastCommitLimitDate.setMonth(lastCommitLimitDate.getMonth() - 12);
        const lastCommitOlderThan12Months = new Date(dateLastCommit) < lastCommitLimitDate;
        if (lastCommitOlderThan12Months) {
            return {
                type: 'outdated',
                details: `Repository not actively maintained, last commit ${monthsSinceDate(new Date(dateLastCommit))} months ago (${new Date(dateLastCommit).toISOString().split('T')[0]})`
            };
        }
        return null;
    }
    catch (error) {
        console.error(`\n ❌ Error checking if repository is maintained: ${error}`);
        return null;
    }
}
function followRedirects(url, maxRedirects = 5) {
    return new Promise((resolve, reject) => {
        let redirectCount = 0;
        function makeRequest(currentUrl) {
            const parsedUrl = new URL(currentUrl);
            const options = {
                hostname: parsedUrl.hostname,
                path: parsedUrl.pathname + parsedUrl.search,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            };
            https.get(options, (response) => {
                if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                    redirectCount++;
                    if (redirectCount > maxRedirects) {
                        reject(new Error(`Too many redirects (${maxRedirects})`));
                        return;
                    }
                    const locationUrl = new URL(response.headers.location, currentUrl);
                    makeRequest(locationUrl.toString());
                }
                else if (response.statusCode === 200) {
                    let data = '';
                    response.on('data', (chunk) => {
                        data += chunk;
                    });
                    response.on('end', () => {
                        resolve(data);
                    });
                }
                else {
                    reject(new Error(`HTTP error: ${response.statusCode}`));
                }
            }).on('error', reject);
        }
        makeRequest(url);
    });
}
function extractLastCommitDate(html) {
    // Pattern 1: look for relative-time with datetime
    const relativeTimeRegex = /<relative-time datetime="([^"]+)"[^>]*>/;
    const relativeTimeMatch = html.match(relativeTimeRegex);
    if (relativeTimeMatch && relativeTimeMatch[1]) {
        return relativeTimeMatch[1];
    }
    // Pattern 2: Look into the div of latest-commit-details
    const latestCommitRegex = /data-testid="latest-commit-details"[^>]*>[\s\S]*?datetime="([^"]+)"/;
    const latestCommitMatch = html.match(latestCommitRegex);
    if (latestCommitMatch && latestCommitMatch[1]) {
        return latestCommitMatch[1];
    }
    // Pattern 3: Look for a better regex for the tag time
    const timeTagRegex = /<time datetime="([^"]+)"[^>]*>/;
    const timeTagMatch = html.match(timeTagRegex);
    if (timeTagMatch && timeTagMatch[1]) {
        return timeTagMatch[1];
    }
    return null;
}
async function fetchLastCommitDate(username, repo) {
    try {
        const apiUrl = `https://api.github.com/repos/${username}/${repo}/commits?per_page=1`;
        return new Promise((resolve, _) => {
            const parsedUrl = new URL(apiUrl);
            const options = {
                hostname: parsedUrl.hostname,
                path: parsedUrl.pathname + parsedUrl.search,
                headers: {
                    'User-Agent': 'Node.js GitHub Repository Checker'
                }
            };
            https.get(options, (response) => {
                let data = '';
                response.on('data', (chunk) => {
                    data += chunk;
                });
                response.on('end', () => {
                    if (response.statusCode === 403) {
                        console.warn('GitHub API rate limit exceeded, falling back to HTML parsing');
                        resolve(null);
                        return;
                    }
                    if (response.statusCode !== 200) {
                        console.warn(`GitHub API returned status ${response.statusCode}, falling back to HTML parsing`);
                        resolve(null);
                        return;
                    }
                    try {
                        const commits = JSON.parse(data);
                        if (Array.isArray(commits) && commits.length > 0 && commits[0].commit && commits[0].commit.committer && commits[0].commit.committer.date) {
                            resolve(commits[0].commit.committer.date);
                        }
                        else {
                            resolve(null);
                        }
                    }
                    catch (error) {
                        console.error('Failed to parse API response:', error);
                        resolve(null);
                    }
                });
            }).on('error', (error) => {
                console.error('API request failed:', error);
                resolve(null);
            });
        });
    }
    catch (error) {
        console.error('Error fetching last commit date:', error);
        return null;
    }
}
