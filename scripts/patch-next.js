#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'server', 'lib', 'start-server.js');
if (!fs.existsSync(filePath)) {
  process.exit(0);
}

const originalSnippet = `                const cleanup = (code)=>{\n                    debug("start-server process cleanup");\n                    server.close();\n                    process.exit(code ?? 0);\n                };`;

const patchedSnippet = `                const normalizeExitCode = (value)=>{\n                    if (typeof value === "string") {\n                        const upper = value.toUpperCase();\n                        if (upper === "SIGINT") {\n                            return 130;\n                        }\n                        if (upper === "SIGTERM") {\n                            return 143;\n                        }\n                        return 1;\n                    }\n                    return value ?? 0;\n                };\n                const cleanup = (code)=>{\n                    debug("start-server process cleanup");\n                    server.close();\n                    process.exit(normalizeExitCode(code));\n                };`;

const fileContent = fs.readFileSync(filePath, 'utf8');
if (fileContent.includes('normalizeExitCode')) {
  process.exit(0);
}

if (!fileContent.includes(originalSnippet)) {
  console.error('Could not find expected cleanup snippet in Next.js start-server.js');
  process.exit(1);
}

const updatedContent = fileContent.replace(originalSnippet, patchedSnippet);
fs.writeFileSync(filePath, updatedContent);
console.log('Patched Next.js start-server cleanup handler for Node.js signal codes.');
