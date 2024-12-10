VENV_NAME = Environment
PYTHON = $(VENV_NAME)/bin/python3.12
PIP = $(VENV_NAME)/bin/pip3.12
REQUIREMENTS = requirements.txt
REQUIRED_PYTHON_VERSION = 3.12.6
PACKAGE ?= __ERROR__

# Define target for 'make'
.PHONY: all
all: install run

# Check Python version
.PHONY: checkPython
checkPython:
	@echo "Checking Python version..."
	@current_version=$$(python3.12 --version | awk '{print $$2}'); \
	if [ "$$current_version" != "$(REQUIRED_PYTHON_VERSION)" ]; then \
		echo "Error: Required Python version is $(REQUIRED_PYTHON_VERSION), but found $$current_version."; \
		exit 1; \
	fi

# Create python3 env
$(VENV_NAME):
	@echo "Creating virtual environment..."
	python3.12 -m venv $(VENV_NAME)

# pip install for env
.PHONY: install
install: $(VENV_NAME)
	@echo "Installing dependencies..."
	$(PIP) install -r $(REQUIREMENTS)

# run main.py
.PHONY: run
run: install
	@echo "Running application..."
	$(PYTHON) main.py

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


# Help target
.PHONY: help
help:
	@echo "Makefile commands:"
	@echo "  make                             - Install environment and run api"
	@echo "  make install                     - Install environment"
	@echo "  make run                         - Run the application"
	@echo "  make clean                       - Remove the virtual environment"
	@echo "  make add PACKAGE=NAME_OF_PACKAGE - Adds Python Package to requirements.txt"  
	@echo "  make help                        - Show this help message"

