import path from 'path';

import { babel } from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import browsersync from 'rollup-plugin-browsersync';

const { data } = require('json-file').read('./package.json');

const year = new Date().getFullYear();

function getHeader() {
  return `/*!
 * ${data.title} v${data.version} (${data.homepage})
 * Copyright ${year} ${data.author}
 * Licensed under MIT (https://github.com/nk-o/flickr-justified-gallery/blob/master/LICENSE)
 */`;
}

const pathCore = path.join(__dirname, 'src/fjGallery.esm.js');
const pathCoreUmd = path.join(__dirname, 'src/fjGallery.umd.js');

const bundles = [
  // Core.
  {
    input: pathCore,
    output: {
      banner: getHeader(),
      file: path.join(__dirname, 'dist/fjGallery.esm.js'),
      format: 'esm',
    },
  },
  {
    input: pathCore,
    output: {
      banner: getHeader(),
      file: path.join(__dirname, 'dist/fjGallery.esm.min.js'),
      format: 'esm',
    },
  },
  {
    input: pathCoreUmd,
    output: {
      banner: getHeader(),
      name: 'fjGallery',
      file: path.join(__dirname, 'dist/fjGallery.js'),
      format: 'umd',
    },
  },
  {
    input: pathCoreUmd,
    output: {
      banner: getHeader(),
      name: 'fjGallery',
      file: path.join(__dirname, 'dist/fjGallery.min.js'),
      format: 'umd',
    },
  },
  {
    input: pathCore,
    output: {
      banner: getHeader(),
      file: path.join(__dirname, 'dist/fjGallery.cjs'),
      format: 'cjs',
    },
  },
];

const isDev = () => 'dev' === process.env.NODE_ENV;
const isUMD = (file) => file.includes('fjGallery.js');
const isMinEnv = (file) => file.includes('.min.');
const isSpecificEnv = (file) => isMinEnv(file);
const isDebugAlways = (file) => (isDev() || isUMD(file) ? 'true' : 'false');

const configs = bundles.map(({ input: inputPath, output }) => ({
  input: inputPath,
  output,
  plugins: [
    nodeResolve(),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      plugins: ['annotate-pure-calls'],
    }),
    replace({
      __DEV__: isSpecificEnv(output.file)
        ? isDebugAlways(output.file)
        : 'process.env.NODE_ENV !== "production"',
      preventAssignment: true,
    }),
    output.file.includes('.min.') && terser(),
  ],
}));

// Copy CSS file to dist.
configs[0].plugins.unshift(
  copy({
    targets: [{ src: 'src/fjGallery.css', dest: 'dist' }],
  })
);

// Dev server.
if (isDev()) {
  configs[configs.length - 1].plugins.push(
    browsersync({
      server: {
        baseDir: ['demo', './'],
      },
    })
  );
}

export default configs;
