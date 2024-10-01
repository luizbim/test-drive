import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { CreateNodes, CreateNodesResult } from '@nx/devkit';

export const createNodes: CreateNodes = [
  'apps/**/Dockerfile',
  (dockerFilePath): CreateNodesResult => {
    const appDir = dirname(dockerFilePath);
    const isProject = existsSync(join(appDir, 'project.json'));

    if (!isProject) {
      return {};
    }

    return {
      projects: {
        [appDir]: {
          targets: {
            'docker-release': {
              executor: 'docker-build:publish',
            },
          },
        },
      },
    };
  },
];
