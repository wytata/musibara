######## CREATE TABLES #################################################################
def print_create_tables(opened_file):

    create_tables_string = """


CREATE TABLE IF NOT EXISTS users (
    userid SERIAL PRIMARY KEY,
    username CHAR(30) UNIQUE,
    ts TIMESTAMPTZ DEFAULT NOW(),
    name VARCHAR,
    password CHAR(60),
    followercount INTEGER,
    followingcount INTEGER
);

CREATE TABLE IF NOT EXISTS herds (
    herdid SERIAL PRIMARY KEY,
    name VARCHAR,
    ts TIMESTAMPTZ DEFAULT NOW(),
    description VARCHAR,
    usercount SMALLINT
);

CREATE TABLE IF NOT EXISTS posts (
    postid SERIAL PRIMARY KEY,
    userid INTEGER,
    ts TIMESTAMPTZ DEFAULT NOW(),
    content TEXT,
    likescount INTEGER,
    commentcount INTEGER,
    url VARCHAR,
    herdid INTEGER,
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (herdid) REFERENCES herds(herdid)
);

-- juntion tables for posts content
CREATE TABLE IF NOT EXISTS postlikes (
    postid INTEGER,
    userid INTEGER,
    ts TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (postid) REFERENCES posts(postid),
    FOREIGN KEY (userid) REFERENCES users(userid)
    -- need to add something here for liking comments?
);

-- juntion tables for posts content
CREATE TABLE IF NOT EXISTS postcomments (
    postcommentid SERIAL PRIMARY KEY,
    parentcommentid INTEGER,
    postid INTEGER,
    userid INTEGER,
    ts TIMESTAMPTZ DEFAULT NOW(),
    content TEXT,
    FOREIGN KEY (postid) REFERENCES posts(postid),
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (parentcommentid) REFERENCES postcomments(postcommentid)
);



CREATE TABLE IF NOT EXISTS playlists (
    playlistid SERIAL PRIMARY KEY,
    name VARCHAR,
    ts TIMESTAMPTZ DEFAULT NOW(),
    userid INTEGER,
    herdid INTEGER,
    FOREIGN KEY (herdid) REFERENCES herds(herdid),
    FOREIGN KEY (userid) REFERENCES users(userid)
);

CREATE TABLE IF NOT EXISTS posttags (
    postid SERIAL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS albums (
    mbid SERIAL PRIMARY KEY,
    name VARCHAR
);

CREATE TABLE IF NOT EXISTS artists (
    mbid SERIAL PRIMARY KEY,
    name VARCHAR
);

CREATE TABLE IF NOT EXISTS songs (
    mbid SERIAL PRIMARY KEY,
    isrc VARCHAR(12),
    name VARCHAR
);

CREATE TABLE IF NOT EXISTS follows (
    followerid INTEGER,
    followingid INTEGER,
    ts TIMESTAMPTZ DEFAULT NOW(),
);
"""

    print(create_tables_string, file = opened_file)
    print("Create tables written")

########################################################################################
