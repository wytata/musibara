def print_drop_tables(opened_file):
    print(
"""

-- Drop Tables Script for Musibara Database

DROP TABLE IF EXISTS playlists CASCADE;
DROP TABLE IF EXISTS postcomments CASCADE;
DROP TABLE IF EXISTS postlikes CASCADE;
DROP TABLE IF EXISTS posttags CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS herds CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS songs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS albums CASCADE;
DROP TABLE IF EXISTS artists CASCADE;
"""
, file = opened_file)

print("Drop tables written")
