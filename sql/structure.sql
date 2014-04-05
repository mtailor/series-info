DROP TABLE IF EXISTS episode;
DROP TABLE IF EXISTS season;
DROP TABLE IF EXISTS serie;


CREATE TABLE serie (
	serie_id             character varying NOT NULL,
	title                character varying NOT NULL,
	moviemeter_rank      smallint NOT NULL
);
ALTER TABLE serie ADD PRIMARY KEY (serie_id);

CREATE TABLE season (
	serie_id             character varying NOT NULL,
	season_num           smallint NOT NULL
);
ALTER TABLE season ADD PRIMARY KEY (serie_id, season_num);
ALTER TABLE season ADD FOREIGN KEY (serie_id) REFERENCES serie ON DELETE CASCADE;


CREATE TABLE episode (
	serie_id             character varying NOT NULL,
	season_num           smallint NOT NULL,
	episode_num          smallint NOT NULL,
	title          		 character varying NOT NULL,
	air_date          	 date NOT NULL
);
ALTER TABLE episode ADD PRIMARY KEY (serie_id, season_num, episode_num);
ALTER TABLE episode ADD FOREIGN KEY (serie_id, season_num) REFERENCES season ON DELETE CASCADE;


