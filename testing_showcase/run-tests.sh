#!/bin/bash

# VoteGuard Test Runner Script
# Convenient script to run different test scenarios

echo "🗳️  VoteGuard Test Suite"
echo "======================="
echo ""

# Function to print colored output
print_success() {
    echo -e "\033[0;32m✅ $1\033[0m"
}

print_info() {
    echo -e "\033[0;34mℹ️  $1\033[0m"
}

print_error() {
    echo -e "\033[0;31m❌ $1\033[0m"
}

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Parse command line arguments
case "$1" in
    "all")
        print_info "Running all tests..."
        npm test
        ;;
    "watch")
        print_info "Running tests in watch mode..."
        npm run test:watch
        ;;
    "coverage")
        print_info "Running tests with coverage report..."
        npm test -- --coverage
        ;;
    "unit")
        print_info "Running unit tests only..."
        npm run test:unit
        ;;
    "utils")
        print_info "Running utility tests..."
        npm test -- __tests__/unit/utils
        ;;
    "middleware")
        print_info "Running middleware tests..."
        npm test -- __tests__/unit/middleware
        ;;
    "controllers")
        print_info "Running controller tests..."
        npm test -- __tests__/unit/controllers
        ;;
    "auth")
        print_info "Running authentication tests..."
        npm test -- authController
        ;;
    "vote")
        print_info "Running vote controller tests..."
        npm test -- voteController
        ;;
    "install")
        print_info "Installing test dependencies..."
        npm install
        print_success "Dependencies installed!"
        ;;
    "clean")
        print_info "Cleaning test artifacts..."
        rm -rf coverage
        rm -rf node_modules/.cache
        print_success "Cleaned!"
        ;;
    *)
        echo "Usage: ./run-tests.sh [command]"
        echo ""
        echo "Commands:"
        echo "  all          - Run all tests"
        echo "  watch        - Run tests in watch mode"
        echo "  coverage     - Run tests with coverage report"
        echo "  unit         - Run unit tests only"
        echo "  utils        - Run utility tests"
        echo "  middleware   - Run middleware tests"
        echo "  controllers  - Run controller tests"
        echo "  auth         - Run auth controller tests"
        echo "  vote         - Run vote controller tests"
        echo "  install      - Install test dependencies"
        echo "  clean        - Clean test artifacts"
        echo ""
        echo "Example: ./run-tests.sh coverage"
        ;;
esac
