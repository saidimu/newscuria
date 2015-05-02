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

function opencalais_instances_by_url(url) {
  var query = {
  	"from": 0,
  	"size": 200,
  	"query": {
  		"filtered": {
  			"filter": {
  				"bool": {
  					"must": {
  						"bool": {
  							"must": [
  								{
  									"query": {
  										"match": {
  											"parent_url": {
  												"query": url,
  												"type": "phrase"
  											}
  										}
  									}
  								},
  								{
  									"range": {
  										"relevance": {
  											"from": "0.3",
  											"to": null,
  											"include_lower": false,
  											"include_upper": true
  										}
  									}
  								}
  							]
  						}
  					}
  				}
  			}
  		}
  	},
  	"_source": {
  		"includes": [
  			"name",
  			"relevance",
  			"instances"
  		],
  		"excludes": []
  	},
  	"sort": [
  		{
  			"relevance": {
  				"order": "desc"
  			}
  		}
  	]
  };

  return query;
}//opencalais_instances_by_url


function opencalais_tags_by_url(url) {
  var query = {
  	"from": 0,
  	"size": 200,
  	"query": {
  		"filtered": {
  			"filter": {
  				"bool": {
  					"must": {
  						"bool": {
  							"must": [
  								{
  									"query": {
  										"match": {
  											"parent_url": {
  												"query": url,
  												"type": "phrase"
  											}
  										}
  									}
  								},
  								{
  									"bool": {
  										"should": [
  											{
  												"range": {
  													"importance": {
  														"from": 1,
  														"to": null,
  														"include_lower": false,
  														"include_upper": true
  													}
  												}
  											},
  											{
  												"range": {
  													"relevance": {
  														"from": "0.5",
  														"to": null,
  														"include_lower": true,
  														"include_upper": true
  													}
  												}
  											}
  										]
  									}
  								}
  							]
  						}
  					}
  				}
  			}
  		}
  	},
  	"_source": {
  		"includes": [
  			"name",
  			"commonname",
  			"importance",
  			"relevance"
  		],
  		"excludes": []
  	},
  	"sort": [
  		{
  			"importance": {
  				"order": "desc"
  			}
  		},
  		{
  			"relevance": {
  				"order": "desc"
  			}
  		}
  	]
  };

  return query;
}//opencalais_tags_by_url


function opencalais_search_by_url(url) {
  var query = {
  	"from": 0,
  	"size": 200,
  	"query": {
  		"filtered": {
  			"filter": {
  				"bool": {
  					"must": {
  						"query": {
  							"match": {
  								"parent_url": {
  									"query": url,
  									"type": "phrase"
  								}
  							}
  						}
  					}
  				}
  			}
  		}
  	},
  	"_source": {
  		"includes": [
  			"name",
  			"relevance",
  			"_type",
  			"_typeGroup",
  			"instances",
  			"resolutions"
  		],
  		"excludes": []
  	},
  	"sort": [
  		{
  			"relevance": {
  				"order": "desc"
  			}
  		}
  	]
  };//query

  return query;
}//opencalais_search_by_url


module.exports  = {
  opencalais_search_by_url: opencalais_search_by_url,
  opencalais_tags_by_url: opencalais_tags_by_url,
  opencalais_instances_by_url: opencalais_instances_by_url,
};//module.exports
