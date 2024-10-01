export function parseTag(tag: string): {
  projectName: string;
  version: string;
} {
  // Split the tag by '@' to separate projectName and version
  const [projectName, version] = tag.split('@');

  if (!projectName || !version) {
    throw new Error(
      `Invalid tag format: ${tag}. Expected format {projectName}@{version}`
    );
  }

  return { projectName, version };
}
