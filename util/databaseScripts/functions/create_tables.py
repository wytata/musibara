######## CREATE TABLES #################################################################
def print_create_tables(opened_file):

    create_tables_string = """


CREATE TABLE IF NOT EXISTS public.users (
    userid SERIAL PRIMARY KEY,
    username CHAR(30) UNIQUE,
    name VARCHAR,
    password CHAR(60)
);

CREATE TABLE IF NOT EXISTS public.posts (
    postid SERIAL PRIMARY KEY,
    userid INTEGER,
    content TEXT,
    likescount INTEGER,
    FOREIGN KEY (userid) REFERENCES public.users(userid)
);

CREATE TABLE IF NOT EXISTS public.herds (
    herdid SERIAL PRIMARY KEY,
    name VARCHAR,
    description VARCHAR,
    usercount SMALLINT
);

CREATE TABLE IF NOT EXISTS public.playlists (
    playlistid SERIAL PRIMARY KEY,
    name VARCHAR,
    userid INTEGER,
    herdid INTEGER,
    FOREIGN KEY (herdid) REFERENCES public.herds(herdid),
    FOREIGN KEY (userid) REFERENCES public.users(userid)
);

CREATE TABLE IF NOT EXISTS public.postcomments (
    postcommentid SERIAL PRIMARY KEY,
    postid INTEGER,
    userid INTEGER,
    FOREIGN KEY (postid) REFERENCES public.posts(postid),
    FOREIGN KEY (userid) REFERENCES public.users(userid)
);

CREATE TABLE IF NOT EXISTS public.posttags (
    postid SERIAL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS public.albums (
    mbid SERIAL PRIMARY KEY,
    name VARCHAR
);

CREATE TABLE IF NOT EXISTS public.artists (
    mbid SERIAL PRIMARY KEY,
    name VARCHAR
);

CREATE TABLE IF NOT EXISTS public.songs (
    mbid SERIAL PRIMARY KEY,
    isrc VARCHAR(12),
    name VARCHAR
);

CREATE TABLE IF NOT EXISTS public.follows (
    followerid INTEGER,
    followingid INTEGER
);
"""

    print(create_tables_string, file = opened_file)
    print("Create tables written")

########################################################################################
