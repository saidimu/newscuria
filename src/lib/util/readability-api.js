/**
 * Copyright (C) 2015  Saidimu Apale
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

var readability = require('readability-api');
var sanitizeHtml = require('sanitize-html');

var config = require('config').get("readability");
var READABILITY_PARSER_TOKEN = config.get('parser_token');

// configure readability object
readability.configure({
    parser_token: READABILITY_PARSER_TOKEN
});

// Create a parser object
var parser = new readability.parser();

// wraper function for Readability Parser API
// returns API response
function scrape_url(url, callback)	{
	// TODO: validate url

	if(!callback)	{
		callback = 	function(err, response)	{
			if(err)	{
				console.log(err);
			} else {
				console.log(response);
			}//if-else
		};//callback
	}//if

	parser.parse(url, function onParse(err, api_response)	{
	    if (err)    {
  			callback(err);
	    } else  {

	        var plaintext = process_text(api_response.content);

	        if(api_response.plaintext)	{
	        	throw new Error("'plaintext' attribute of API response already pre-filled by Readability.");
	        } else {
	        	api_response.plaintext = plaintext;
	        	callback(undefined, api_response);
	        }//if-else

	    }//if-else
	});

}//scrape_url()


// based on
// http://nodeexamples.com/2012/09/27/scraping-a-pages-content-using-the-node-readability-module-and-node-js/
function process_text(html)	{
	var plaintext = sanitizeHtml(html, {
		allowedTags: [],
		allowedAttributes: {}
	});

	// RegEx to remove needless newlines and whitespace.
	// See: http://stackoverflow.com/questions/816085/removing-redundant-line-breaks-with-regular-expressions
	plaintext = plaintext.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/ig, "\n");

	// Return the final string, minus any leading/trailing whitespace.
	return plaintext.trim();
}//process_text()


module.exports = {
	scrape: scrape_url,
	process_text: process_text,
};//module.exports
