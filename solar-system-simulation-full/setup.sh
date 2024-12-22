#!/bin/bash

# Stop the script if any command fails
set -e

echo "Setting up the Solar System Simulation project..."

# Step 1: Create and activate a virtual environment
echo "Creating a virtual environment..."
python3 -m venv venv

echo "Activating the virtual environment..."
source venv/bin/activate

# Step 2: Upgrade pip and install dependencies
echo "Upgrading pip and installing required Python packages..."
pip install --upgrade pip
pip install -r requirements.txt

# Step 3: Set Flask environment variables
echo "Setting Flask environment variables..."
export FLASK_APP=app.py
export FLASK_ENV=development

# Step 4: Notify setup completion
echo "Setup complete! You can now run the Flask app using the following command:"
echo "  flask run"

# Automatically run the Flask app (optional)
echo "Starting the Flask app..."
flask run
