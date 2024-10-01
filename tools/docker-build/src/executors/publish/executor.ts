import * as path from 'path';
import { ExecutorContext, PromiseExecutor } from '@nx/devkit';
import { PublishExecutorSchema } from './schema';
import { execSync } from 'child_process';
import { checkDockerInstallation, checkDockerfile } from './checkers';
import { dockerRegistryLogin } from './actions';
import { parseTag } from './utils';
const runExecutor: PromiseExecutor<PublishExecutorSchema> = async (
  options: PublishExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> => {
  console.info(`Executing "docker-release" executor`);
  console.info(`Options: ${JSON.stringify(options, null, 2)}`);
  const projectRoot = context.workspace.projects[context.projectName].root;

  // Parse the tag to extract projectName and version
  const { projectName, version } = parseTag(options.tag);

  // Check if Docker is installed before proceeding
  if (!checkDockerInstallation()) {
    return { success: false };
  }
  // Login to the Docker registry
  if (!dockerRegistryLogin(options.authType)) {
    return { success: false };
  }

  if (!checkDockerfile(projectRoot, options.dockerFileName)) {
    return { success: false };
  }

  try {
    const dockerTags = [version];
    if (options.addLatestTag) {
      dockerTags.push('latest');
    }
    const registry = options.registry ? `${options.registry}/` : '';
    const namespace = options.namespace ? `${options.namespace}/` : '';
    const tagOption = dockerTags
      .map(
        (dockerTag) =>
          `--tag ${registry}${namespace}${projectName}:${dockerTag}`
      )
      .join(' ');

    const dockerfileOption = options.dockerFileName
      ? `--file ${path.resolve(projectRoot, options.dockerFileName)}`
      : '';

    const pushOption = options.push ? ` ${tagOption} --push` : '';
    const platformOption = options.platforms
      ? `--platform ${options.platforms}`
      : '';

    const buildCommand = `docker buildx build ${platformOption} ${dockerfileOption} ${tagOption} ${pushOption} .`;

    execSync(buildCommand, { stdio: 'inherit' });

    return {
      success: true,
    };
  } catch (err: unknown) {
    console.error(`Error during Docker image build or push: ${err}`);
    return { success: false };
  }
};

export default runExecutor;
