import { execSync } from 'child_process';
export function checkDockerInstallation() {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch (error: unknown) {
    console.error(
      `Docker is not installed or not running. Please install Docker and ensure it is running. Error: ${error}`
    );
    return false;
  }
}
