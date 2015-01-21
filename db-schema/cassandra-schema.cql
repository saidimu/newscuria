CREATE keyspace newscuria WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };

USE newscuria;

CREATE TABLE author_urls	(
	author varchar,
	url varchar,
	word_count int,
	date_published timestamp,
	created_date timeuuid,
	PRIMARY KEY ((author,url),date_published)
) WITH CLUSTERING ORDER BY (date_published DESC);

CREATE TABLE domain_urls	(
	domain varchar,
	url varchar,
	word_count int,
	date_published timestamp,
	created_date timeuuid,
	PRIMARY KEY ((domain,url),date_published)
) WITH CLUSTERING ORDER BY (date_published DESC);

CREATE TABLE readability	(
	url varchar,
	api_result blob,
	date_published timestamp,
	created_date timeuuid,
	PRIMARY KEY (url,date_published)
);

CREATE TABLE opencalais	(
	url varchar,
	api_result blob,
	date_published timestamp,
	created_date timeuuid,
	PRIMARY KEY (url,date_published)
);

CREATE TABLE users (
	username varchar,
	created_date timeuuid,
	PRIMARY KEY (username)
);

CREATE TABLE twitter_users (
	username varchar,
	created_date timeuuid,
	PRIMARY KEY (username)
);

CREATE TABLE twitter_user_urls	(
	username varchar,
	url varchar,
	visited_date timeuuid,
	PRIMARY KEY ((username,url),visited_date)
) WITH CLUSTERING ORDER BY (visited_date DESC);

CREATE TABLE user_urls	(
	username varchar,
	url varchar,
	visited_date timeuuid,
	PRIMARY KEY ((username,url),visited_date)
) WITH CLUSTERING ORDER BY (visited_date DESC);


CREATE TABLE received_urls  (
  url varchar,
  latest_received_date timestamp,
  PRIMARY KEY (url, latest_received_date)
) WITH CLUSTERING ORDER BY (latest_received_date DESC);

CREATE INDEX on received_urls(latest_received_date);