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

module.exports = rule;

// WCAG 1.1.1 Non-text Content
// http://www.w3.org/TR/WCAG20/#text-equiv-all
// http://www.w3.org/TR/2014/NOTE-WCAG20-TECHS-20140916/H67
function rule (config, dom, report, done) {
	getImages(dom)
		.filter(hasEmptyAltAttribute)
		.filter(hasNonEmptyTitleAttribute)
		.forEach(function (input) {
			report({
				code: 'wcag-1.1.1-h67',
				level: config.level || 'error',
				message: 'Images must have a non-empty `alt` attribute ' +
						 'if their `title` attribute is non-empty',
				evidence: input.outerHTML
			});
		});
	done();
}

function getImages (dom) {
	return Array.prototype.slice.call(dom.document.querySelectorAll('img'));
}

function hasEmptyAltAttribute (img) {
	var alt = img.getAttribute('alt');
	return (alt !== null && alt.trim() === '');
}

function hasNonEmptyTitleAttribute (img) {
	var title = img.getAttribute('title');
	return (title !== null && title.trim() !== '');
}
