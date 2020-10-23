import { getBabelOutputPlugin } from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import sizes from 'rollup-plugin-sizes'

export default [
  {
    input: 'src/index.js',
    output: {
      name: 'exalted.future',
      file: 'dist/index.umd.js',
      format: 'umd'
    },
    plugins: [resolve(), commonjs(), sizes()]
  },
  {
    input: 'src/index.js',
    external: ['ms'],
    plugins: [sizes(), getBabelOutputPlugin({ presets: ['@babel/preset-env'] })],
    output: [{ file: 'dist/index.cjs', format: 'cjs' }]
  },
  {
    input: 'src/index.js',
    external: ['ms'],
    plugins: [sizes(), getBabelOutputPlugin({ presets: ['@babel/preset-env'] })],
    output: [{ file: 'dist/index.esm.js', format: 'es' }]
  }]
