from functions.create_tables import print_create_tables
from functions.drop_tables import print_drop_tables
from functions.users import create_users
from functions.posts import create_posts
from functions.herds import create_herds
from functions.likes import create_users_likes
from functions.comments import create_users_comments
def main():
    print("Generating all table data!")
    file = open("create_and_populate_all_DB.sql" , "w")

    print_drop_tables(file)
    print_create_tables(file)
    users = create_users(file, 100)
    users_herds = create_herds(file, 10, users)
    posts_likes, posts_comments = create_posts(file, 1000, users, users_herds)
    create_users_likes(file, posts_likes, users)
    create_users_comments(file, posts_comments, users)
    file.close()
    print("Done generating data!")


if __name__ == "__main__":
    main()

