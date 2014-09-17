#!/usr/bin/env node

// This file is part of pa11y.
//
// pa11y is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// pa11y is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with pa11y.  If not, see <http://www.gnu.org/licenses/>.

'use strict';

var chalk = require('chalk');
var glob = require('glob');
var loadReporter = require('../lib/reporters').loadReporter;
var pa11y = require('../lib/pa11y');
var path = require('path');
var pkg = require('../package.json');
var program = require('commander');

initProgram();
runProgram();

function initProgram () {
	program
		.version(pkg.version)
		.usage('[options] <url|html>')
		.option('-i, --ignore [rules]', 'A comma-separated list of rules to ignore', optionToArray)
		.option('-R, --reporter [reporter]', 'The name of a reporter to use', 'cli')
		.option('-r, --rules [rules]', 'A comma-separated list of rules to use', optionToArray)
		.option('-s, --suite [name]', 'The name of a suite to use rules from')
		.option('-u, --useragent [ua]', 'The user-agent to send to the page being tested', null)
		.on('--help', function () {
			console.log('  Available suites:');
			console.log();
			getSuiteNames().forEach(function (suite) {
				console.log('    ' + suite);
			});
			console.log();
			console.log('  Available rules:');
			console.log();
			getRuleNames().forEach(function (rule) {
				console.log('    ' + rule);
			});
			console.log();
		})
		.parse(process.argv);
}

function optionToArray (opt) {
	return (opt ? opt.split(',') : []);
}

function runProgram () {
	if (program.args.length) {
		runProgramOnArgument();
	} else {
		runProgramOnStdIn();
	}
}

function runProgramOnArgument () {
	runPa11y(program.args.join(' '));
}

function runProgramOnStdIn () {
	if (process.stdin.isTTY) {
		program.help();
	} else {
		captureStdIn(runPa11y);
	}
}

function captureStdIn (done) {
	var data = '';
	process.stdin.resume();
	process.stdin.on('data', function (chunk) {
		data += chunk;
	});
	process.stdin.on('end', function () {
		done(data);
	});
}

function runPa11y (context) {
	try {
		var reporter = loadReporter(program.reporter);
		var opts = buildPa11yOptions(program);
		var test = pa11y.init(opts);
		test(context, function (err, results) {
			if (err) {
				return reportError(err);
			}
			var info = {
				name: pkg.name,
				version: pkg.version,
				context: context,
				options: opts
			};
			reporter(info, console, results);
			process.exit(results.filter(isErrorResult).length);
		});
	} catch (err) {
		return reportError(err);
	}
}

function buildPa11yOptions (program) {
	var opts = {
		ignore: program.ignore,
		rules: program.rules,
		suite: program.suite
	};
	if (!opts.rules && !opts.suite) {
		opts.suite = 'wcag2aa';
	}
	if (program.useragent) {
		opts.useragent = program.useragent;
	}
	return opts;
}

function reportError (err) {
	console.error(chalk.red('Error:', err.message));
	process.exit(-1);
}

function isErrorResult (result) {
	return (result.level === 'error');
}

function getSuiteNames () {
	return glob.sync(__dirname + '/../suite/**.json')
		.map(getSuiteNameFromPath)
		.filter(filterSuiteNames);
}

function getSuiteNameFromPath (filePath) {
	return path.basename(filePath, path.extname(filePath));
}

function filterSuiteNames (name) {
	return (name !== 'test');
}

function getRuleNames () {
	return glob.sync(__dirname + '/../rule/**/*.js')
		.map(getRuleNameFromPath)
		.filter(filterRuleNames);
}

function getRuleNameFromPath (filePath) {
	return path.relative(__dirname + '/../rule/', filePath).replace(path.extname(filePath), '');
}

function filterRuleNames (name) {
	return !/^test\//.test(name);
}
