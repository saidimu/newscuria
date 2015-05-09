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

function opencalais_people_by_url(url)  {
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
  									"or": {
  										"filters": [
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Person",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "PersonCareer",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Quotation",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Position",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "PersonAttributes",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "PersonCareer",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "PersonCommunication",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "PersonEducation",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "PersonEmailAddress",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "PersonLocation",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "PersonParty",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "PersonTravel",
  															"type": "phrase"
  														}
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
  			"_type",
  			"name",
  			"relevance"
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
}//opencalais_people_by_url


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


function opencalais_places_by_url(url)  {
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
  									"or": {
  										"filters": [
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "ProvinceOrState",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Facility",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "City",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Continent",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Country",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "NaturalFeature",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Region",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "CompanyLocation",
  															"type": "phrase"
  														}
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
  			"_type",
  			"name",
  			"relevance"
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
}//opencalais_places_by_url


function opencalais_things_by_url(url)  {
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
    								"or": {
    									"filters": [
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "Movie",
    														"type": "phrase"
    													}
    												}
    											}
    										},
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "TVShow",
    														"type": "phrase"
    													}
    												}
    											}
    										},
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "Currency",
    														"type": "phrase"
    													}
    												}
    											}
    										},
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "EmailAddress",
    														"type": "phrase"
    													}
    												}
    											}
    										},
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "FaxNumber",
    														"type": "phrase"
    													}
    												}
    											}
    										},
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "MedicalCondition",
    														"type": "phrase"
    													}
    												}
    											}
    										},
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "MedicalTreatment",
    														"type": "phrase"
    													}
    												}
    											}
    										},
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "MusicAlbum",
    														"type": "phrase"
    													}
    												}
    											}
    										},
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "MusicGroup",
    														"type": "phrase"
    													}
    												}
    											}
    										},
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "OperatingSystem",
    														"type": "phrase"
    													}
    												}
    											}
    										},
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "PhoneNumber",
    														"type": "phrase"
    													}
    												}
    											}
    										},
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "ProgrammingLanguage",
    														"type": "phrase"
    													}
    												}
    											}
    										},
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "SportsGame",
    														"type": "phrase"
    													}
    												}
    											}
    										},
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "SportsLeague",
    														"type": "phrase"
    													}
    												}
    											}
    										},
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "Technology",
    														"type": "phrase"
    													}
    												}
    											}
    										},
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "TVShow",
    														"type": "phrase"
    													}
    												}
    											}
    										},
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "URL",
    														"type": "phrase"
    													}
    												}
    											}
    										},
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "CandidatePosition",
    														"type": "phrase"
    													}
    												}
    											}
    										},
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "CompanyProduct",
    														"type": "phrase"
    													}
    												}
    											}
    										},
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "CompanyTechnology",
    														"type": "phrase"
    													}
    												}
    											}
    										},
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "CompanyTicker",
    														"type": "phrase"
    													}
    												}
    											}
    										},
    										{
    											"query": {
    												"match": {
    													"_type": {
    														"query": "CompanyUsingProduct",
    														"type": "phrase"
    													}
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
    		"_type",
    		"name",
    		"relevance"
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
}//opencalais_things_by_url


function opencalais_relations_by_url(url) {
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
  									"or": {
  										"filters": [
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "GenericRelations",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "BusinessRelation",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "CompanyAffiliates",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "CompanyCompetitor",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "CompanyCustomer",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "FamilyRelation",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "PoliticalRelationship",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "PersonRelation",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "ContactDetails",
  															"type": "phrase"
  														}
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
  			"_type",
  			"verb",
  			"relationsubject",
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
  };//query

  return query;
}//opencalais_relations_by_url


function opencalais_companies_by_url(url) {
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
  									"or": {
  										"filters": [
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Company",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "MarketIndex",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "IndustryTerm",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Organization",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Product",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "PublishedMedium",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "RadioProgram",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "RadioStation",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "TVStation",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "CompanyEmployeesNumber",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "CompanyReorganization",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "CompanyRestatement",
  															"type": "phrase"
  														}
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
  };//query

  return query;
}//opencalais_companies_by_url


function opencalais_events_by_url(url)  {
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
  									"or": {
  										"filters": [
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Anniversary",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "EntertainmentAwardEvent",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Holiday",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "MedicalCondition",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "PoliticalEvent",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "SportsEvent",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Acquisition",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Alliance",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "ArmedAttack",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "ArmsPurchaseSale",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Arrest",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Bankruptcy",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "AnalystEarningsEstimate",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "AnalystRecommendation",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "BonusSharesIssuance",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "BusinessRelation",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Buybacks",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "CompanyAccountingChange",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "CompanyEarningsAnnouncement",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "CompanyEarningsGuidance",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "CompanyExpansion",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "CompanyForceMajeure",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "CompanyFounded",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "CompanyInvestment",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "CompanyLaborIssues",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "CompanyLayoffs",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "CompanyLegalIssues",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "CompanyListingChange",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "CompanyMeeting",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "CompanyNameChange",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "ConferenceCall",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Conviction",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "CreditRating",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "DebtFinancing",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "DelayedFiling",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "DiplomaticRelations",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Dividend",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "EmploymentChange",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "EmploymentRelation",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "EnvironmentalIssue",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "EquityFinancing",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Extinction",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "FDAPhase",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "IndicesChanges",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Indictment",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "IPO",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "JointVenture",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "ManMadeDisaster",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Merger",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "MilitaryAction",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "MovieRelease",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "MusicAlbumRelease",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "NaturalDisaster",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "PatentFiling",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "PatentIssuance",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "PoliticalEndorsement",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "PollsResult",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "ProductIssues",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "ProductRecall",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "ProductRelease",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "SecondaryIssuance",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "StockSplit",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "Trial",
  															"type": "phrase"
  														}
  													}
  												}
  											},
  											{
  												"query": {
  													"match": {
  														"_type": {
  															"query": "VotingResult",
  															"type": "phrase"
  														}
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
  			"instances",
  			"relevance"
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
}//opencalais_events_by_url


module.exports  = {
  opencalais_search_by_url   : opencalais_search_by_url,
  opencalais_tags_by_url     : opencalais_tags_by_url,
  opencalais_instances_by_url: opencalais_instances_by_url,
  opencalais_people_by_url   : opencalais_people_by_url,
  opencalais_places_by_url   : opencalais_places_by_url,
  opencalais_things_by_url   : opencalais_things_by_url,
  opencalais_relations_by_url: opencalais_relations_by_url,
  opencalais_companies_by_url: opencalais_companies_by_url,
  opencalais_events_by_url   : opencalais_events_by_url,
};//module.exports
