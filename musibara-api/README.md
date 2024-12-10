This is a FastAPI project using Python 3.12.6.

## Installing Dependencies/Running
Our API server is intended to run on a Unix system. For Windows users, the best option is to run the server using WSL or a separate virtual machine. The command given below to compile and run the server also installs the necessary Python dependencies and sets up a Python virtual environment in which you can develop.

### Requirements
- WSL or a *nix system
- Python 3.12.6
- Make 

### To compile and run 
```bash 
make
```
### For more options
```bash 
make help
```
## Environment Setup
In order to run the client application, you must define the following environment variables (this can be done by setting the variables in a .env file at the top of the musibara-api subdirectory):
```bash
DB_USER="YOUR_DB_USER"
DB_PASS="YOUR_DB_PASSWORD"
DB_HOST="YOUR_DB_IP_ADDR_OR_HOSTNAME"
DB_NAME="YOUR_DB_NAME"
AWS_KEY="YOUR_AWS_KEY"
AWS_SEC_KEY="YOUR_AWS_SEC_KEY"
AWS_REGION="YOUR_AWS_REGION"
AWS_BUCKET_NAME="YOUR_AWS_BUCKET_NAME"
ORIGIN="YOUR_ORIGIN" # Domain Name
SECRET_KEY="YOUR_SECRET_KEY" # Secret Key for JWT Authentication
ALGORITHM="YOUR_ALGORITHM" # Algorithm for JWT Authentication
```
