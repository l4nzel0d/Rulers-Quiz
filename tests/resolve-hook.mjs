import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

/* Lets `node --experimental-strip-types` run the pure logic modules directly:
 * it teaches Node the tsconfig `@/*` alias and TypeScript's extensionless
 * relative imports. The lib/ and data/ modules import nothing from React
 * Native at runtime, so they need no bundler to be testable. */

const SRC = new URL('../src/', pathToFileURL(import.meta.filename)).href;

export function resolve(specifier, context, next) {
  if (specifier.startsWith('@/')) {
    return next(SRC + specifier.slice(2) + '.ts', context);
  }
  if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
    const candidate = new URL(specifier + '.ts', context.parentURL ?? SRC);
    if (existsSync(fileURLToPath(candidate))) return next(candidate.href, context);
  }
  return next(specifier, context);
}
