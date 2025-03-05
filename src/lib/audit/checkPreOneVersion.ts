import semver from 'semver';
import { Issue } from '../../types/Issue.type.js';

export async function checkPreOneVersion(depVersion: string): Promise<Issue | null> {
  const isPreOne = depVersion.startsWith('0.') || 
    depVersion.startsWith('^0.') ||
    (semver.valid(depVersion) && semver.lt(depVersion, '1.0.0'));

  if (isPreOne) {
    return {
      type: 'pre_1.0',
      details: `Unstable version (${depVersion})`
    };
  }
  return null;
}
