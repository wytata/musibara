
######## DROP TABLES  #################################################################
def print_drop_tables(opened_file):
    print(
"""

-- Drop Tables Script for Musibara Database

DROP TABLE IF EXISTS public.playlists CASCADE;
DROP TABLE IF EXISTS public.postcomments CASCADE;
DROP TABLE IF EXISTS public.posttags CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.herds CASCADE;
DROP TABLE IF EXISTS public.follows CASCADE;
DROP TABLE IF EXISTS public.songs CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.albums CASCADE;
DROP TABLE IF EXISTS public.artists CASCADE;
"""
, file = opened_file)

print("Drop tables written")
#######################################################################################
