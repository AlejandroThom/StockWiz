#!/bin/bash
# Script to run tests with coverage for SonarQube

# Install coverage if not already installed
pip install -q coverage

# Run tests with coverage
coverage run -m unittest test_lambda_function.py

# Generate XML report for SonarQube
coverage xml -o coverage.xml

# Generate HTML report (optional, for local viewing)
coverage html -d htmlcov

# Display coverage report
coverage report

echo ""
echo "Coverage report generated:"
echo "  - XML (for SonarQube): coverage.xml"
echo "  - HTML (for viewing): htmlcov/index.html"

