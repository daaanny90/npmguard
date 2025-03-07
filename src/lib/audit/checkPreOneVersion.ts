import { Issue } from '../../types/Issue.type.js';

export async function checkPreOneVersion(depVersion: string): Promise<Issue | null> {
  const cleanVersion = depVersion.replace(/^[\^~]/, '');

  const versionParts = cleanVersion.split('.');

  const isPreOne = versionParts[0] === '0' || 
    (versionParts[0] === '0' && versionParts[1] === '0' && versionParts[2] === '0') ||
    (parseInt(versionParts[0], 10) < 1);

  if (isPreOne) {
    return {
      type: 'pre_1.0',
      details: `Unstable version (${depVersion})`
    };
  }
  return null;
}
