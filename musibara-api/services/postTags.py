import json
from typing import Union, List, Dict, Optional

from musicbrainzngs.caa import musicbrainz
from config.db import get_db_connection
import musicbrainzngs

async def set_post_tags(tags: list[dict], post_id: int):
    # Function to be called only after successful insertion of post into database
    # Note: treat return value False as error
    if not tags:
        return True
    if not all(tag['tag_type'].lower() in ["songs", "artists", "albums"] for tag in tags):
        return False
    try:
        db = get_db_connection()
        cursor = db.cursor()
        values_list = ','.join(cursor.mogrify(f"({str(post_id)}, %s, %s, %s)", tuple(tag.values())).decode('utf-8') for tag in tags)
        cursor.execute("INSERT INTO posttags (postid, resourcetype, mbid, name) VALUES " + values_list)
        db.commit()
        return True
    except Exception as e:
        print(e)
        return None

# Not using
async def get_posts_with_tag(mbid: str):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("SELECT posts.postid FROM posts RIGHT JOIN posttags on posts.postid = posttags.postid WHERE posttags.mbid = %s", (mbid,))
        rows = cursor.fetchall()

        post_ids = [row[0] for row in rows]
        print(post_ids)
        cursor.execute("SELECT * FROM posts RIGHT JOIN posttags on posts.postid = posttags.postid WHERE posttags.postid IN %s", (tuple(post_ids),))

        rows = cursor.fetchall()
        columnNames = [desc[0] for desc in cursor.description]
        all_posts = [dict(zip(columnNames, row)) for row in rows]

        result = {}
        done = set()
        for post in all_posts:
            print(post)
            if post['postid'] in done:
                result[post['postid']]['tags'].append({'resourcetype':post['resourcetype'], 'mbid':post['mbid'], 'name':post['name']})
            else:
                done.add(post['postid'])
                post['tags'] = [{'resourcetype':post['resourcetype'], 'mbid':post['mbid'], 'name':post['name']}]
                del(post['resourcetype'])
                del(post['mbid'])
                del(post['name'])
                result[post['postid']] = post
            print(done)
        return [result[postid] for postid in result.keys()]
    except Exception as e:
        print(e)
        return None

async def get_tags_by_postid(postid: int):
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute('''
        SELECT * FROM posttags WHERE postid = %s;
    ''', (postid, ))

    rows = cursor.fetchall()
    columnNames = [desc[0] for desc in cursor.description]
    cursor.close()
    post_tags = [dict(zip(columnNames, row)) for row in rows]
    return post_tags

async def get_tag_info(mbid: str):
    db = get_db_connection()
    cursor = db.cursor()
    query = """
        SELECT
            name, resourcetype
        FROM 
            posttags 
        WHERE 
            mbid = %s;
    """
    cursor.execute(query, (mbid, ))

    rows = cursor.fetchall()
    columnNames = [desc[0] for desc in cursor.description]
    cursor.close()
    post_tags = dict(zip(columnNames, rows[0]))

    try:
        if post_tags["resourcetype"] == "songs":
            recording_result = musicbrainzngs.get_recording_by_id(mbid, includes=["artists", "ratings", "url-rels", "releases"])
            post_tags["mbdata"] = recording_result
        elif post_tags["resourcetype"] == "albums":
            try:
                release_result = musicbrainzngs.get_release_by_id(mbid)
                post_tags["mbdata"] = release_result
            except Exception as e:
                print(e)
                try:
                    release_result = musicbrainzngs.get_release_group_by_id(mbid)
                    post_tags["mbdata"] = release_result
                except Exception as e:
                    print(e)
        elif post_tags["resourcetype"] == "artists":
            artist_result = musicbrainzngs.get_artist_by_id(mbid, includes=["tags"])
            post_tags["mbdata"] = artist_result
    except Exception as e:
        print(e)
        
    return post_tags






