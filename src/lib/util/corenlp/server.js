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
'use strict';

var appname = "stanford_corenlp";
// var log = require('_/util/logging.js')(appname);

var util = require('util');

var config = require('config').get('stanford_corenlp');

var NLP = require('stanford-corenlp');
var coreNLP;

// only run if config file allows
if(!config.get('enabled')) {
  console.log();
  // log.info({
  //   log_type : log.types.corenlp.CORENLP,
  // }, 'Stanford CoreNLP is DISABLED.');

} else {

  coreNLP = new NLP.StanfordNLP({
    'nlpPath': config.get('nlpPath'),
    'version': config.get('version')
  });

  coreNLP.loadPipelineSync();

}//if-else


function start()  {
}//start()


function process(text, callback)  {
  if(!callback) {
    // log.error({
    //   log_type : log.types.corenlp.CORENLP,
    // }, 'No callback provided!');

    return;
  }//if

  try {
    coreNLP.process(text, callback);
  } catch (e) {
    // log.error({
    //   err: e,
    //   log_type : log.types.corenlp.PROCESS_ERROR,
    // }, 'Error processing text.');
  }//try-catch

}//process


function get_dependencies(options, callback)  {
  var nlp_result           = options.nlp_result || {};
  var dependency_type      = options.dependency_type || config.get('dependency_type');
  var dependency_relations = options.dependency_relations || config.get('dependency_relations');
  var max_dependencies     = options.max_dependencies || config.get('max_dependencies');

  if(!nlp_result) {
    // log.error({
    //   log_type : log.types.corenlp.PROCESS_ERROR,
    // }, 'Empty or missing CoreNLP results object!');

    return;
  }//if


  if(!callback) {
    // log.error({
    //   log_type : log.types.corenlp.CORENLP,
    // }, 'No callback provided!');

    return;
  }//if

  var all_deps = [];

  nlp_result.document.sentences.sentence.forEach(function(sentence) {
    sentence.dependencies.forEach(function(dependency)  {
      if(dependency.$.type === dependency_type)  {
        var deps = dependency.dep.filter(function(d) {
          // console.log('%s in %s', d.$.type, dependency_relations);
          return (dependency_relations.indexOf(d.$.type) >= 0);
        });//dependency.dep.filter

        all_deps = all_deps.concat(deps);
      }//if
    });//sentence.dependencies.forEach

    // trim the resulting dependencies according to specified max_length
    // FIXME: TODO: more efficient to stop nested looping when max_length reached?
    all_deps = all_deps.splice(0, max_dependencies);

  });//nlp_result.document.sentences.sentence.forEach

  all_deps.map(function(d) {
    console.log(d.$.type, " : ", d.dependent._, d.governor._);
  });//deps.map

  callback(null, all_deps);

}//get_dependencies


module.exports = {
  start: start,
  process: process,
  get_dependencies: get_dependencies,
};//module.exports
