#!/bin/bash

# Stop script on error
set -e

# Print the current action
echo "Setting up the Solar System Simulation project..."

# Step 1: Create a virtual environment
echo "Creating a virtual environment..."
python3 -m venv venv

# Step 2: Activate the virtual environment
echo "Activating the virtual environment..."
source venv/bin/activate

# Step 3: Install Python dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Step 4: Run the Flask application
echo "Starting the Flask app..."
export FLASK_APP=app.py
export FLASK_ENV=development
flask run
