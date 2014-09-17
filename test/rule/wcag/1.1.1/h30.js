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

/* jshint maxstatements: false, maxlen: false */
/* global beforeEach, describe, it */
'use strict';

var assert = require('proclaim');
var jsdom = require('jsdom');
var sinon = require('sinon');

describe('rule/wcag/1.1.1/h30', function () {
	var config, dom, html, report, rule;

	beforeEach(function (done) {
		rule = require('../../../../rule/wcag/1.1.1/h30');
		config = {};
		report = sinon.spy();
		html = [
			'<img src="foo.png" title="foo" alt=""/>',
			'<a href="#"><img src="bar.png" title="bar" alt=""/></a>',
			'<a href="#"><img src="baz.png" title="baz" alt=""/></a>',
			'<a href="#"><img src="qux.png" title="qux"/></a>'
		].join('');
		jsdom.env(html, function (err, win) {
			dom = win;
			done();
		});
	});

	it('should call `report` for each image in an anchor that has a title, but doesn\'t have alternative text', function (done) {
		rule(config, dom, report, function () {
			assert.strictEqual(report.callCount, 2);
			done();
		});
	});

	it('should report with the expected code, level, and message', function (done) {
		rule(config, dom, report, function () {
			var code = 'wcag-1.1.1-h30';
			var level = 'error';
			var message = 'Images in anchors must have alternative text when the anchor contains no text content';
			assert.strictEqual(report.getCall(0).args[0].code, code);
			assert.strictEqual(report.getCall(0).args[0].level, level);
			assert.strictEqual(report.getCall(0).args[0].message, message);
			assert.strictEqual(report.getCall(1).args[0].code, code);
			assert.strictEqual(report.getCall(1).args[0].level, level);
			assert.strictEqual(report.getCall(1).args[0].message, message);
			done();
		});
	});

	it('should report with the configured level if it\'s specified', function (done) {
		config = {level: 'warning'};
		rule(config, dom, report, function () {
			assert.strictEqual(report.getCall(0).args[0].level, config.level);
			assert.strictEqual(report.getCall(1).args[0].level, config.level);
			done();
		});
	});

	it('should include HTML evidence in the report', function (done) {
		rule(config, dom, report, function () {
			assert.strictEqual(report.getCall(0).args[0].evidence, '<a href="#"><img src="bar.png" title="bar" alt=""></a>');
			assert.strictEqual(report.getCall(1).args[0].evidence, '<a href="#"><img src="baz.png" title="baz" alt=""></a>');
			done();
		});
	});

});
