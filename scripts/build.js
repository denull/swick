const fs = require('fs');
const babel = require('@babel/core');
const Terser = require('terser');

const src = fs.readFileSync('swick.js', 'utf8');
const ie11 = babel.transformSync(src, {
  presets: [[
    "@babel/env", {
      targets: {
        ie: 11,
      },
    }
  ]]
});
const min = Terser.minify(src, {
  compress: {
    ecma: 2015,
  },
});
const ie11min = Terser.minify(ie11.code, {
  compress: {
    ecma: 5,
  },
});

// Make a copy for docs
fs.writeFileSync('docs/swick.js', src);
fs.writeFileSync('docs/swick-compat.js', src);

// Create minified version
fs.writeFileSync('swick.min.js', min.code);

// IE11 version
fs.writeFileSync('swick-compat.js', ie11.code);
fs.writeFileSync('swick-compat.min.js', ie11min.code);