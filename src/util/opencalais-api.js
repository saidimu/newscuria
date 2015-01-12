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
function extract_entities(plaintext, callback)	{

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
		delete api_response.doc.info.document;
		
		callback(err, api_response);
	});

}//extract_entities()


module.exports = {
	fetch_nlp_content: extract_entities,
};//module.exports