import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default {
  input: './index.js',
  output: [
    { file: 'dist/controlly.cjs', format: 'cjs', exports: 'named' },
    { file: 'dist/controlly.mjs', format: 'esm' }
  ],
  plugins: [nodeResolve(), commonjs(), json()]
};