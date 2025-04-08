// build.js
const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['extension.js'], // your main file
    bundle: true,
    minify: true,
    platform: 'node',
    outfile: 'dist/extension.js',
    external: ['vscode'], // required for VS Code APIs
}).catch(() => process.exit(1));
