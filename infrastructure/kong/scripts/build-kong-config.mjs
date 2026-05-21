import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import yaml from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kongRoot = path.resolve(__dirname, '..');
const infraRoot = path.resolve(kongRoot, '..');
const outputPath = path.join(kongRoot, 'kong.yml');
const checkOnly = process.argv.includes('--check');
const { parse, stringify } = yaml;

function parseEnvFile(content) {
  return content
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .reduce((env, line) => {
      const separatorIndex = line.indexOf('=');
      if (separatorIndex === -1) {
        return env;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      env[key] = value;
      return env;
    }, {});
}

async function loadEnv() {
  const candidates = ['.env', '.env.example'];

  for (const candidate of candidates) {
    const envPath = path.join(infraRoot, candidate);
    try {
      const content = await readFile(envPath, 'utf8');
      return parseEnvFile(content);
    } catch {
      continue;
    }
  }

  return {};
}

function resolveEnvToken(value, env) {
  if (typeof value !== 'string') {
    return value;
  }

  return value.replace(/\$\{([^}]+)\}/gu, (_, token) => env[token] ?? '');
}

async function readYamlArray(directoryName) {
  const directory = path.join(kongRoot, directoryName);
  const files = (await readdir(directory))
    .filter((file) => file.endsWith('.yml'))
    .sort();

  const entries = await Promise.all(
    files.map(async (file) => {
      const content = await readFile(path.join(directory, file), 'utf8');
      const parsed = parse(content) ?? [];
      if (!Array.isArray(parsed)) {
        throw new Error(`Expected ${directoryName}/${file} to contain a YAML array.`);
      }
      return parsed;
    })
  );

  return entries.flat();
}

function toKongService(service, env) {
  const resolvedUrl = resolveEnvToken(service.url, env);
  const url = new URL(resolvedUrl);
  const nextService = { ...service };

  delete nextService.url;

  nextService.protocol = url.protocol.replace(':', '');
  nextService.host = url.hostname;
  nextService.port = Number(url.port || (url.protocol === 'https:' ? 443 : 80));

  if (url.pathname && url.pathname !== '/') {
    nextService.path = url.pathname;
  }

  return nextService;
}

function routeServiceName(route) {
  if (typeof route.service === 'string') {
    return route.service;
  }

  if (route.service && typeof route.service === 'object' && typeof route.service.name === 'string') {
    return route.service.name;
  }

  throw new Error(`Route "${route.name ?? '<unnamed>'}" is missing service.name.`);
}

function pluginRouteName(plugin) {
  if (typeof plugin.route === 'string') {
    return plugin.route;
  }

  if (plugin.route && typeof plugin.route === 'object' && typeof plugin.route.name === 'string') {
    return plugin.route.name;
  }

  return null;
}

const env = await loadEnv();
const services = (await readYamlArray('services')).map((service) => toKongService(service, env));
const routes = (await readYamlArray('routes')).map((route) => ({
  ...route,
  serviceName: routeServiceName(route)
}));
const plugins = await readYamlArray('plugins');

const routePlugins = new Map();
const globalPlugins = [];

for (const plugin of plugins) {
  const targetRoute = pluginRouteName(plugin);

  if (!targetRoute) {
    globalPlugins.push(plugin);
    continue;
  }

  const bucket = routePlugins.get(targetRoute) ?? [];
  const nextPlugin = { ...plugin };
  delete nextPlugin.route;
  bucket.push(nextPlugin);
  routePlugins.set(targetRoute, bucket);
}

const renderedServices = services.map((service) => {
  const serviceRoutes = routes
    .filter((route) => route.serviceName === service.name)
    .map((route) => {
      const nextRoute = { ...route };
      delete nextRoute.service;
      delete nextRoute.serviceName;

      const pluginsForRoute = routePlugins.get(route.name) ?? [];
      if (pluginsForRoute.length > 0) {
        nextRoute.plugins = pluginsForRoute;
      }

      return nextRoute;
    });

  return {
    ...service,
    routes: serviceRoutes
  };
});

const renderedObject = {
  _format_version: '3.0',
  _transform: true,
  services: renderedServices
};

if (globalPlugins.length > 0) {
  renderedObject.plugins = globalPlugins;
}

const rendered = stringify(renderedObject, {
  lineWidth: 0
});

if (checkOnly) {
  let current = '';
  try {
    current = await readFile(outputPath, 'utf8');
  } catch {
    current = '';
  }

  if (current !== rendered) {
    console.error('Kong config is stale. Run: node infrastructure/kong/scripts/build-kong-config.mjs');
    process.exit(1);
  }

  console.log('Kong config is up to date.');
  process.exit(0);
}

await writeFile(outputPath, rendered, 'utf8');
console.log(`Wrote ${path.relative(process.cwd(), outputPath)}`);
