import { ExecutorContext } from '@nx/devkit';

import { PublishExecutorSchema } from './schema';
import executor from './executor';

const options: PublishExecutorSchema = {} as PublishExecutorSchema;
const context: ExecutorContext = {
  root: '',
  cwd: process.cwd(),
  isVerbose: false,
};

describe('Publish Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
