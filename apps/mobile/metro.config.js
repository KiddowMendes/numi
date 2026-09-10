const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

// Use standard metro config without expo file map to avoid OneDrive readlink issues
const config = getDefaultConfig(projectRoot, {
  // Disable expo's custom file map which causes readlink issues on OneDrive
  isCSSEnabled: true,
});

// Use polling watcher to avoid OneDrive readlink issues
config.watchman = false;
config.unstable_enableSymlinks = false;

// Watch the monorepo root so Metro sees workspace packages
config.watchFolders = [monorepoRoot];

// Resolve workspace packages from monorepo node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Resolve .js imports to .ts files for workspace packages (TypeScript ESM convention)
// Only strip .js from relative imports (starting with . or ..)
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.endsWith('.js') && /^\.\.?\//.test(moduleName)) {
    const stripped = moduleName.slice(0, -3);
    return originalResolveRequest
      ? originalResolveRequest(context, stripped, platform)
      : context.resolveRequest(context, stripped, platform);
  }
  return originalResolveRequest
    ? originalResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
