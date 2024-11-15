def print_drop_tables(opened_file):
    print(
"""

-- Drop the triggers
DROP TRIGGER IF EXISTS increment_postlikescount ON postlikes;
DROP TRIGGER IF EXISTS decrement_postlikescount ON postlikes;

DROP TRIGGER IF EXISTS increment_postcommentcount ON postcomments;
DROP TRIGGER IF EXISTS decrement_postcommentcount ON postcomments;

DROP TRIGGER IF EXISTS increment_postcomments_likescount ON postcommentlikes;
DROP TRIGGER IF EXISTS decrement_postcomments_likescount ON postcommentlikes;

-- Drop the functions
DROP FUNCTION IF EXISTS update_postlikescount();
DROP FUNCTION IF EXISTS update_postcommentcount();
DROP FUNCTION IF EXISTS update_postcomments_likescount();

-- Drop Tables Script for Musibara Database
DROP TABLE IF EXISTS playlists CASCADE;
DROP TABLE IF EXISTS herdsusers CASCADE;
DROP TABLE IF EXISTS postcommentlikes CASCADE;
DROP TABLE IF EXISTS postcomments CASCADE;
DROP TABLE IF EXISTS postlikes CASCADE;
DROP TABLE IF EXISTS posttags CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS herds CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS playlistsongs CASCADE;
DROP TABLE IF EXISTS songs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS albums CASCADE;
DROP TABLE IF EXISTS artists CASCADE;
DROP TABLE IF EXISTS images CASCADE;
"""
, file = opened_file)

print("Drop tables written")
