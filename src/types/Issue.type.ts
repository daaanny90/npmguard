export interface Issue {
  type: 'pre_1.0' | 'outdated' | 'archived_repo' | 'old_release';
  details: string;
};
