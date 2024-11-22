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
    spotifyaccesstoken VARCHAR,
    spotifyrefreshtoken VARCHAR,
    applemusictoken VARCHAR,
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

CREATE TABLE IF NOT EXISTS herdmembers (
    herdid INT,
    userid INT,
    FOREIGN KEY (userid) REFERENCES users(userid) ON DELETE CASCADE,
    FOREIGN KEY (herdid) REFERENCES herds(herdid) ON DELETE CASCADE,
    UNIQUE(herdid, userid)
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

--juntion tables for likes of comments on posts
CREATE TABLE IF NOT EXISTS postcommentlikes(
    postcommentid INTEGER,
    userid INTEGER,
    createdts TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (postcommentid) REFERENCES postcomments(postcommentid),
    FOREIGN KEY (userid) REFERENCES users(userid)
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
    postid SERIAL,
    FOREIGN KEY (postid) REFERENCES posts(postid)
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
    name VARCHAR,
    imageid INT,
    FOREIGN KEY (imageid) REFERENCES images(imageid)
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
    songid INTEGER,
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (playlistid) REFERENCES playlists(playlistid) ON DELETE CASCADE,
    FOREIGN KEY (songid) REFERENCES songs(mbid),
    UNIQUE(playlistid, songid)
);

CREATE TABLE artistsongs (
  artistid VARCHAR,
  songid VARCHAR,
  FOREIGN KEY (artistid) REFERENCES artists(mbid),
  FOREIGN KEY (songid) REFERENCES songs(mbid),
  UNIQUE (artistid, songid)
)

CREATE TABLE albumsongs (
  albumid VARCHAR,
  songid VARCHAR,
  FOREIGN KEY (albumid) REFERENCES albums(mbid),
  FOREIGN KEY (songid) REFERENCES songs(mbid),
  UNIQUE (albumid, songid)
)

CREATE TABLE artistalbums (
  artistid VARCHAR,
  albumid VARCHAR,
  FOREIGN KEY (artistid) REFERENCES artists(mbid),
  FOREIGN KEY (albumid) REFERENCES albums(mbid),
  UNIQUE (artistid, albumid)
)

CREATE TABLE playlistimports (
  playlistid INT,
  externalid VARCHAR,
  completed BOOLEAN,
  FOREIGN KEY (playlistid) REFERENCES playlists(playlistid) ON DELETE CASCADE
)

CREATE OR REPLACE FUNCTION update_followcount()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users
        SET followercount = followercount + 1
        WHERE userid = NEW.followingid;

        UPDATE users
        SET followingcount = followingcount + 1
        WHERE userid = NEW.userid;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users
        SET followercount = followercount - 1
        WHERE userid = OLD.followingid;

        UPDATE users
        SET followingcount = followingcount - 1
        WHERE userid = OLD.userid;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_followcount
AFTER INSERT ON follows
FOR EACH ROW
EXECUTE FUNCTION update_followcount();

CREATE TRIGGER decrement_followcount
AFTER DELETE ON follows
FOR EACH ROW
EXECUTE FUNCTION update_followcount();

CREATE OR REPLACE FUNCTION update_herdmembercount()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE herds
        SET usercount = usercount + 1
        WHERE herdid = NEW.herdid;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE herds
        SET usercount = usercount - 1
        WHERE herdid = OLD.herdid;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_herdmembercount
AFTER INSERT ON herdmembers
FOR EACH ROW
EXECUTE FUNCTION update_herdmembercount();

CREATE TRIGGER decrement_herdmembercount
AFTER DELETE ON herdmembers
FOR EACH ROW
EXECUTE FUNCTION update_herdmembercount();

CREATE OR REPLACE FUNCTION update_postlikescount()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts
        SET likescount = likescount + 1
        WHERE postid = NEW.postid;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts
        SET likescount = likescount - 1
        WHERE postid = OLD.postid;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_postlikescount
AFTER INSERT ON postlikes
FOR EACH ROW
EXECUTE FUNCTION update_postlikescount();

CREATE TRIGGER decrement_postlikescount
AFTER DELETE ON postlikes
FOR EACH ROW
EXECUTE FUNCTION update_postlikescount();

CREATE OR REPLACE FUNCTION update_postcommentcount()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts
        SET commentcount = COALESCE(commentcount, 0) + 1
        WHERE postid = NEW.postid;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts
        SET commentcount = COALESCE(commentcount, 0) - 1
        WHERE postid = OLD.postid;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_postcommentcount
AFTER INSERT ON postcomments
FOR EACH ROW
EXECUTE FUNCTION update_postcommentcount();

CREATE TRIGGER decrement_postcommentcount
AFTER DELETE ON postcomments
FOR EACH ROW
EXECUTE FUNCTION update_postcommentcount();

CREATE OR REPLACE FUNCTION update_postcomments_likescount()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE postcomments
        SET likescount = COALESCE(likescount, 0) + 1
        WHERE postcommentid = NEW.postcommentid;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE postcomments
        SET likescount = COALESCE(likescount, 0) - 1
        WHERE postcommentid = OLD.postcommentid;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_postcomments_likescount
AFTER INSERT ON postcommentlikes
FOR EACH ROW
EXECUTE FUNCTION update_postcomments_likescount();

CREATE TRIGGER decrement_postcomments_likescount
AFTER DELETE ON postcommentlikes
FOR EACH ROW
EXECUTE FUNCTION update_postcomments_likescount();

"""

    print(create_tables_string, file = opened_file)
    print("Create tables written")

########################################################################################
