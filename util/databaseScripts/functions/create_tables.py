######## CREATE TABLES #################################################################
def print_create_tables(opened_file):

    create_tables_string = """

CREATE TABLE IF NOT EXISTS images(
    imageid SERIAL PRIMARY KEY,
    region VARCHAR,
    bucket VARCHAR,
    key VARCHAR,
    url TEXT
);

CREATE TABLE IF NOT EXISTS users (
    userid SERIAL PRIMARY KEY,
    username VARCHAR UNIQUE,
    name VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    bio TEXT,
    biolink VARCHAR,
    password VARCHAR,
    followercount INTEGER,
    followingcount INTEGER,
    postscount INTEGER,
    profilephoto INTEGER,
    bannerphoto INTEGER,
    createdts TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (profilephoto) REFERENCES images(imageid),
    FOREIGN KEY (bannerphoto) REFERENCES images(imageid)
);

CREATE TABLE IF NOT EXISTS herds (
    herdid SERIAL PRIMARY KEY,
    name VARCHAR,
    description VARCHAR,
    usercount SMALLINT,
    imageid INTEGER,
    createdts TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (imageid) REFERENCES images(imageid)
);

CREATE TABLE IF NOT EXISTS posts (
    postid SERIAL PRIMARY KEY,
    userid INTEGER,
    content TEXT,
    likescount INTEGER,
    commentcount INTEGER,
    imageid INTEGER,
    herdid INTEGER,
    createdts TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    title VARCHAR(255) DEFAULT 'Default Title' NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (herdid) REFERENCES herds(herdid),
    FOREIGN KEY (imageid) REFERENCES images(imageid)
);

-- juntion tables for posts content
CREATE TABLE IF NOT EXISTS postlikes (
    postid INTEGER,
    userid INTEGER,
    createdts TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
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
    content TEXT,
    likescount INTEGER DEFAULT 1 NOT NULL,
    createdts TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (postid) REFERENCES posts(postid),
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (parentcommentid) REFERENCES postcomments(postcommentid)
);



CREATE TABLE IF NOT EXISTS playlists (
    playlistid SERIAL PRIMARY KEY,
    name VARCHAR,
    description TEXT,
    imageid INTEGER,
    userid INTEGER,
    herdid INTEGER,
    createdts TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (herdid) REFERENCES herds(herdid),
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (imageid) REFERENCES images(imageid)
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
    isrc VARCHAR,
    name VARCHAR
);

CREATE TABLE IF NOT EXISTS follows (
    userid INTEGER,
    followingid INTEGER,
    createdts TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (followingid) REFERENCES users(userid)
);

CREATE TABLE IF NOT EXISTS herdsusers(
    userid INTEGER,
    herdid INTEGER,
    createdts TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (herdid) REFERENCES herds(herdid)
);

CREATE TABLE IF NOT EXISTS playlistsongs(
    userid INTEGER,
    playlistid INTEGER,
    songid VARCHAR,
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (playlistid) REFERENCES playlists(playlistid),
    FOREIGN KEY (songid) REFERENCES songs(mbid),
    UNIQUE(playlistid, songid)
);

"""

    print(create_tables_string, file = opened_file)
    print("Create tables written")

########################################################################################
