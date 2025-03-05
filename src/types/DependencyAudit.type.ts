import { Issue } from "./Issue.type.js";

export interface DependencyAudit {
  name: string;
  version: string;
  url: string;
  issues: Issue[]
}
