VENV_NAME = MusibaraAPI
PYTHON_ALIAS = python3
PYTHON = $(VENV_NAME)/bin/python3.12
PIP = $(VENV_NAME)/bin/pip3.12
PYTEST = $(VENV_NAME)/bin/pytest
REQUIREMENTS = requirements.txt
REQUIRED_PYTHON_VERSION = 3.12
PACKAGE ?= __ERROR__
KEY = key.pem
CERT = cert.pem


# Define target for 'make'
.PHONY: all
all: checkPython install run

.PHONY: make secure
make secure: checkPython install run-https


# Check Python version
.PHONY: checkPython
checkPython:
	@echo "Checking Python version..."
	@current_version=$$(python3 --version | awk '{print $$2}'); \
	if ! echo "$$current_version" | grep -qE '^3\.12\..*$$'; then \
		echo "Error: Required Python version is $(REQUIRED_PYTHON_VERSION), but found $$current_version."; \
		exit 1; \
	fi

# Create python3 env
$(VENV_NAME):
	@echo "Creating virtual environment..."
	$(PYTHON_ALIAS) -m venv $(VENV_NAME)

# pip install for env
.PHONY: install
install: $(VENV_NAME)
	@echo "Installing dependencies..."
	$(PIP) install -r $(REQUIREMENTS)

# run main.py
.PHONY: run
run: install
	@echo "Running application..."
	$(PYTHON) -m uvicorn --host 0.0.0.0 --port 8000 main:app --reload

.PHONY: certs
certs: $(CERT)
	@echo "Creating certs..."

$(CERT): $(KEY)
	openssl req -new -x509 -key $(KEY) -out $(CERT) -days 365

$(KEY):
	openssl genpkey -algorithm RSA -out $(KEY)

#run main.py securely
.PHONY: run-https
run-https: install certs
	@echo "Running secure application..."
	$(PYTHON) -m uvicorn --host 0.0.0.0 --port 8000 main:app --reload --ssl-keyfile=key.pem --ssl-certfile=cert.pem


#run unit test
.PHONY: test
test: install
	@echo "Running unit tests..."
	$(PYTEST)


# add package to requirements.txt
.PHONY: add
add: install
	@if [ "$(PACKAGE)" = "__ERROR__" ]; then \
		echo "Error: Please include package name.\n\nExample:\nmake add PACKAGE=NAME_OF_PACKAGE"; \
		exit 1; \
	fi
	@echo "Adding new package: $(PACKAGE)"
	$(PIP) install $(PACKAGE)
	$(PIP) freeze > $(REQUIREMENTS)



# Delete env
.PHONY: clean
clean:
	@echo "Removing virtual environment..."
	rm -rf $(VENV_NAME)
	@echo "Removing pycache..."
	find . -type d -name '__pycache__' -exec rm -r {} +
	rm -f $(KEY) $(CERT)


# Help target
.PHONY: help
help:
	@echo "Makefile commands:"
	@echo "  make                             - Install environment and run api"
	@echo "  make secure                      - Install environment and run api with HTTPS"
	@echo "  make install                     - Install environment"
	@echo "  make run                         - Run the application"
	@echo "  make run-https                   - Run the app securely with HTTPS"
	@echo "  make clean                       - Remove the virtual environment"
	@echo "  make add PACKAGE=NAME_OF_PACKAGE - Adds Python Package to requirements.txt"  
	@echo "  make help                        - Show this help message"
	@echo "  make test                        - Run unit tests"
