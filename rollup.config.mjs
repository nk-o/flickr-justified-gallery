/* eslint-disable import/no-extraneous-dependencies */
import { babel } from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import serve from 'rollup-plugin-serve';

import data from './package.json' assert { type: 'json' };

const year = new Date().getFullYear();

function getHeader() {
  return `/*!
 * ${data.title} v${data.version} (${data.homepage})
 * Copyright ${year} ${data.author}
 * Licensed under MIT (https://github.com/nk-o/flickr-justified-gallery/blob/master/LICENSE)
 */`;
}

const pathCore = './src/fjGallery.esm.js';
const pathCoreUmd = './src/fjGallery.umd.js';

const bundles = [
  // Core.
  {
    input: pathCore,
    output: {
      banner: getHeader(),
      file: './dist/fjGallery.esm.js',
      format: 'esm',
    },
  },
  {
    input: pathCore,
    output: {
      banner: getHeader(),
      file: './dist/fjGallery.esm.min.js',
      format: 'esm',
    },
  },
  {
    input: pathCoreUmd,
    output: {
      banner: getHeader(),
      name: 'fjGallery',
      file: './dist/fjGallery.js',
      format: 'umd',
    },
  },
  {
    input: pathCoreUmd,
    output: {
      banner: getHeader(),
      name: 'fjGallery',
      file: './dist/fjGallery.min.js',
      format: 'umd',
    },
  },
  {
    input: pathCore,
    output: {
      banner: getHeader(),
      file: './dist/fjGallery.cjs',
      format: 'cjs',
    },
  },
];

const isDev = () => process.env.NODE_ENV === 'dev';
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
    serve({
      open: true,
      contentBase: ['demo', './'],
      port: 3002,
    })
  );
}

export default configs;
