from functions.create_tables import print_create_tables
from functions.drop_tables import print_drop_tables
from functions.users import create_users
from functions.posts import create_posts
from functions.herds import create_herds
from functions.likes import create_users_likes
from functions.comments import create_users_comments
from functions.following import follow_users
from functions.images import create_images
from functions.herd_users import create_users_in_herds
from functions.songs import create_songs

def main():
    print("Generating all table data!")
    file = open("create_and_populate_all_DB.sql" , "w")
    
    number_of_users: int = 100
    number_of_herds: int = 10
    number_of_posts: int = 1000

    print_drop_tables(file)
    print_create_tables(file)
    image_id = create_images(file)
    users = create_users(file, number_of_users, image_id)
    users_herds = create_herds(file, number_of_herds, users, image_id)
    create_users_in_herds(file, users_herds)
    posts_likes, posts_comments = create_posts(file, number_of_posts, users, users_herds, image_id)
    create_users_likes(file, posts_likes, users)
    create_users_comments(file, posts_comments, users)
    follow_users(file, users)
    create_songs(file)
    file.close()
    print("Done generating data!")


if __name__ == "__main__":
    main()

