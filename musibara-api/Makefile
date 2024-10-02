VENV_NAME = MusibaraAPI
PYTHON = $(VENV_NAME)/bin/python
PIP = $(VENV_NAME)/bin/pip
REQUIREMENTS = requirements.txt
REQUIRED_PYTHON_VERSION = 3.12.6


# Define target for 'make'
.PHONY: all
all: checkPython install run

# Check Python version
.PHONY: checkPython
checkPython:
	@echo "Checking Python version..."
	@current_version=$$(python3 --version | awk '{print $$2}'); \
	if [ "$$current_version" != "$(REQUIRED_PYTHON_VERSION)" ]; then \
		echo "Error: Required Python version is $(REQUIRED_PYTHON_VERSION), but found $$current_version."; \
		exit 1; \
	fi

# Create python3 env
$(VENV_NAME):
	@echo "Creating virtual environment..."
	python3 -m venv $(VENV_NAME)

# pip install for env
.PHONY: install
install: $(VENV_NAME)
	@echo "Installing dependencies..."
	$(PIP) install -r $(REQUIREMENTS)

# run main.py
.PHONY: run
run: install
	@echo "Running application..."
	$(PYTHON) -m uvicorn main:app --reload


# Delete env
.PHONY: clean
clean:
	@echo "Removing virtual environment..."
	rm -rf $(VENV_NAME)
	@echo "Removing pycache..."
	rm -r ./__pycache__

# Help target
.PHONY: help
help:
	@echo "Makefile commands:"
	@echo "  make           - Install environment and run api"
	@echo "  make run       - Run the application"
	@echo "  make clean     - Remove the virtual environment"
	@echo "  make help      - Show this help message"

