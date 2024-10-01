export interface PublishExecutorSchema {
  registry?: string;
  namespace: string;
  tag: string;
  dockerFileName: string;
  authType: 'password' | 'token';
  push: boolean;
  addLatestTag: boolean;
  platforms?: string;
}
