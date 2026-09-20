import * as migration_20260920_211504_initial from './20260920_211504_initial';

export const migrations = [
  {
    up: migration_20260920_211504_initial.up,
    down: migration_20260920_211504_initial.down,
    name: '20260920_211504_initial'
  },
];
