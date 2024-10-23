Musibara is a music-sharing social media application we are developing for our CSCE 482 semester project. 


### How to run back-end
1. Install Posgres and PSQL CLI
2. Start your instance
3. Go to './util/databaseScripts/' and run:
```bash
make
```
4. Run the sql file: 
```bash
psql postgres -f ./create_and_populate_all_DB.sql
```
5. Now you can run the api, now go to ./musibara-api/, install python3.12.7, and run:
```bash
make
```
6. Now it should be working :)


