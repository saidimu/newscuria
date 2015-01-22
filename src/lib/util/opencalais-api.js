/**
Copyright (C) 2015  Saidimu Apale
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
**/
'use strict';

var Calais = require('calais').Calais;

var config = require('config').get("opencalais");

var OPENCALAIS_API_KEY = config.get('api_key');
var OPENCALAIS_USER_AGENT = config.get('user_agent');

// parameter explainations: http://www.opencalais.com/documentation/calais-web-service-api/forming-api-calls/input-parameters
// defaults: https://github.com/mcantelon/node-calais/blob/master/lib/calais.js
// FIXME: read from environment/config values
var calais = new Calais(OPENCALAIS_API_KEY, {
  'contentType': 'text/raw',
  'outputFormat': 'object',
  'reltagBaseURL': '',
  'calculateRelevanceScore': true,
  'enableMetadataType': 'GenericRelations,SocialTags',
  'docRDFaccessible': false,
  'allowDistribution': false,
  'allowSearch': false,
  'cleanResult': false,
  'proxy': '',
  'omitOutputtingOriginalText': true,
  'submitter': OPENCALAIS_USER_AGENT,
});


// a wrapper function for opencalais.com API call
function get_content(plaintext, callback)	{

	if(!callback)	{
		callback = function(api_response, err)	{
			if(err)	{
				console.log(err);
			} else {
				console.log(api_response);
			}//if-else
		};//callback
	}//if

	// TODO: check 'text' input
	if(plaintext)	{
		// set the text to be processed
		calais.set('content', plaintext);		
	} else {
		return callback(new Error("Plaintext cannot be empty."), {});
	}//if-else

	// submit text to API to extract entities
	calais.fetch(function(api_response, err)	{
		// fix bug with Calais library returning original doc in results
    if (api_response.doc) {
      delete api_response.doc.info.document;
    }//if
		
		callback(err, api_response);
	});

}//get_content()


module.exports = {
	get_content: get_content,
};//module.exports