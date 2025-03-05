export function parseGitHubRepoUrl(repoUrl) {
  if(!repoUrl) {
    console.error(`\n ❌ npm info does not contain repository URL. Please check the package manually.`);
    return null;
  }

  let url;

  if (repoUrl.hasOwnProperty('url')) {
    url = repoUrl.url;
  } else {
    url = repoUrl
  }

  if(!url) {
    console.error(`\n ❌ npm info does not contain repository URL. Please check the package manually.`);
    return null;
  }

  const cleanUrl = url
  .replace(/^git\+/, '')
  .replace(/^ssh:\/\//, '')
  .replace(/^git@/, '')
  .replace(/^git:\/\//, '')
  .replace(/^https?:\/\//, '')
  .replace(/\.git$/, '')
  .replace('github.com:', '')
  .replace('github.com/', '');

  const splittedUrl = cleanUrl.split('/').filter(Boolean);

  return splittedUrl[0] && splittedUrl[1] ? {username: splittedUrl[0], repo: splittedUrl[1], url: cleanUrl} : null;
}
