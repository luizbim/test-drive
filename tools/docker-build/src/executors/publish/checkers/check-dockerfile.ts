import * as fs from 'fs';
import * as path from 'path';

export function checkDockerfile(
  projectRoot: string,
  dockerfileName = 'Dockerfile'
): boolean {
  const dockerfilePath = path.join(projectRoot, dockerfileName);

  // Check if the Dockerfile exists
  if (!fs.existsSync(dockerfilePath)) {
    console.error(`Dockerfile is missing in ${projectRoot}.`);
    return false;
  }

  // Check if the Dockerfile is non-empty and has basic commands
  const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');

  if (!dockerfileContent.trim()) {
    console.error(`Dockerfile in ${projectRoot} is empty.`);
    return false;
  }

  // Optional: Check for basic Dockerfile commands like FROM, CMD, ENTRYPOINT
  const essentialCommands = ['FROM', 'CMD', 'ENTRYPOINT'];
  const hasValidCommands = essentialCommands.some((cmd) =>
    dockerfileContent.includes(cmd)
  );

  if (!hasValidCommands) {
    console.error(
      `Dockerfile in ${projectRoot} does not contain basic commands like FROM, CMD, or ENTRYPOINT.`
    );
    return false;
  }

  return true;
}
