import { execSync } from 'child_process';

export function dockerRegistryLogin(
  authType: 'password' | 'token' = 'token'
): boolean {
  const registry = process.env.DOCKER_REGISTRY || '';
  const username = process.env.DOCKER_USERNAME || '';
  const password = process.env.DOCKER_PASSWORD || ''; // Only used when authType is 'password'
  const token = process.env.DOCKER_TOKEN || ''; // Only used when authType is 'token'

  if (!registry || !username) {
    console.error(
      'Docker registry login credentials are missing. Ensure DOCKER_REGISTRY and DOCKER_USERNAME are set.'
    );
    return false;
  }

  try {
    let loginCommand = '';
    if (authType === 'token') {
      if (!token) {
        console.error(
          'Docker registry login token is missing. Ensure DOCKER_TOKEN is set OR change the login method to `password` instead.'
        );
        return false;
      }
      loginCommand = `docker login -u ${username} -p ${token} ${registry}`;
    } else {
      if (!password) {
        console.error(
          'Docker registry login password is missing. Ensure DOCKER_PASSWORD is set OR change the login method to `token` instead.'
        );
        return false;
      }
      loginCommand = `docker login -u ${username} -p ${password} ${registry}`;
    }

    // Docker login command using environment variables
    execSync(loginCommand, { stdio: 'inherit' });

    return true;
  } catch (error) {
    console.error('Docker login failed:', error);
    return false;
  }
}
