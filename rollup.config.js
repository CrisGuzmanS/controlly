import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: './index.js',
  output: [
    { file: 'dist/controlly.cjs.js', format: 'cjs', exports: 'named' },
    { file: 'dist/controlly.esm.js', format: 'esm' }
  ],
  plugins: [nodeResolve(), commonjs()],
  external: ['meily'],
};