import { execSync } from 'child_process';
export function checkBuildxInstallation(): boolean {
  try {
    execSync('docker buildx version', { stdio: 'ignore' });
    return true;
  } catch (error: unknown) {
    console.error(
      `Docker buildx is not installed. Please install Docker buildx. Error: ${error}`
    );
    return false;
  }
}
