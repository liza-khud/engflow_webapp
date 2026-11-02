// Generates config.js from defaults.json so the browser (which can't fetch local
// files over file://) and the tests read the exact same values.
// Usage: node build-config.js
const fs = require('fs');
const path = require('path');

const defaults = JSON.parse(fs.readFileSync(path.join(__dirname, 'defaults.json'), 'utf8'));
const out =
  '// GENERATED from defaults.json by build-config.js. Do not edit by hand.\n' +
  'const CONFIG = ' + JSON.stringify(defaults, null, 2) + ';\n' +
  "if (typeof module !== 'undefined') module.exports = CONFIG;\n";
fs.writeFileSync(path.join(__dirname, 'config.js'), out);
console.log('config.js written');
