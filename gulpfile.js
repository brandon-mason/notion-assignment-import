const { src, dest, parallel } = require('gulp');

const browserify = require('browserify');
const tsify = require('tsify');
const sourceStream = require('vinyl-source-stream');

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { debug = false } = yargs(hideBin(process.argv)).argv;

const sources = {
	map(key, func) {
		return this[key].map(func);
	},
	markup: [
		{
			glob: 'src/*.html',
			base: 'src',
		},
	],
	style: [
		{
			glob: 'src/*.css',
			base: 'src',
		},
	],
	assets: [
		{
			glob: 'assets/favicon/*',
			base: 'assets',
		},
	],
	scripts: [
		{
			glob: 'src/extension.ts',
			base: 'src',
			outFile: 'extension.js',
		},
		{
			glob: 'src/parseAssignments.ts',
			base: 'src',
			outFile: 'parseAssignments.js',
		},
		{
			glob: 'src/options.ts',
			base: 'src',
			outFile: 'options.js',
		},
	],
};

function copy(source) {
	return function copyGlob() {
		return src(source.glob, { base: source?.base ?? '.' })
			.pipe(dest('dist'));
	};
}

function bundle(source) {
	return function bundleGlob() {
		return browserify({
			debug,
			entries: source.glob,
			basedir: source?.base ?? '.',
		})
			.plugin(tsify)
			.plugin('tinyify')
			.bundle()
			.pipe(sourceStream(`${source?.outFile ?? 'bundle.js'}`))
			.pipe(dest('dist'));
	};
}

exports.default = parallel(
	...sources.map('markup', copy),
	...sources.map('style', copy),
	...sources.map('scripts', bundle),
);