from functions.create_tables import print_create_tables
from functions.drop_tables import print_drop_tables
from functions.users import create_users
from functions.posts import create_posts
def main():
    print("Generating all table data!")
    file = open("create_and_populate_all_DB.sql" , "w")

    print_drop_tables(file)
    print_create_tables(file)
    create_users(file)
    create_posts(file)

    file.close()
    print("Done generating data!")


if __name__ == "__main__":
    main()

