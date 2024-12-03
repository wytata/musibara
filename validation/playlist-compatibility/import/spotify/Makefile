VENV_NAME = PlaylistValidationEnv
PYTHON = $(VENV_NAME)/bin/python3.12
PIP = $(VENV_NAME)/bin/pip3.12
REQUIREMENTS = requirements.txt
REQUIRED_PYTHON_VERSION = 3.12.6
PACKAGE ?= __ERROR__

# Define target for 'make'
.PHONY: all
all: install 

# Create python3 env
$(VENV_NAME):
	@echo "Creating virtual environment..."
	python3.12 -m venv $(VENV_NAME)

# pip install for env
.PHONY: install
install: $(VENV_NAME)
	@echo "Installing dependencies..."
	$(PIP) install -r $(REQUIREMENTS)

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
	@echo "  make clean                       - Remove the virtual environment"
	@echo "  make add PACKAGE=NAME_OF_PACKAGE - Adds Python Package to requirements.txt"  
	@echo "  make help                        - Show this help message"

