import * as migration_20260920_211504_initial from './20260920_211504_initial';
import * as migration_20260920_223608_cloud_storage from './20260920_223608_cloud_storage';

export const migrations = [
  {
    up: migration_20260920_211504_initial.up,
    down: migration_20260920_211504_initial.down,
    name: '20260920_211504_initial',
  },
  {
    up: migration_20260920_223608_cloud_storage.up,
    down: migration_20260920_223608_cloud_storage.down,
    name: '20260920_223608_cloud_storage'
  },
];
