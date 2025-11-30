#!/bin/bash
# Script to run tests with coverage for SonarQube

# Install coverage if not already installed
pip install -q coverage

# Run tests with coverage (source=. to include current directory)
coverage run --source=. -m unittest test_lambda_function.py

# Generate XML report for SonarQube (uses .coveragerc config)
coverage xml

# Generate HTML report (optional, for local viewing)
coverage html -d htmlcov

# Display coverage report with missing lines
coverage report -m

echo ""
echo "Coverage report generated:"
echo "  - XML (for SonarQube): coverage.xml"
echo "  - HTML (for viewing): htmlcov/index.html"

