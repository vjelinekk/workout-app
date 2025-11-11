#!/bin/bash

# Integration Test Runner Script
# This script sets up and runs integration tests

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Integration Test Runner${NC}"
echo "================================"

# Function to check if test database is running
check_test_db() {
    if docker ps | grep -q "workout-db-test"; then
        echo -e "${GREEN}✓ Test database is running${NC}"
        return 0
    else
        echo -e "${RED}✗ Test database is not running${NC}"
        return 1
    fi
}

# Function to check if test redis is running
check_test_redis() {
    if docker ps | grep -q "workout-redis-test"; then
        echo -e "${GREEN}✓ Test Redis is running${NC}"
        return 0
    else
        echo -e "${RED}✗ Test Redis is not running${NC}"
        return 1
    fi
}

# Function to start test database
start_test_db() {
    echo -e "${YELLOW}Starting test database...${NC}"
    docker-compose up db-test -d
    
    # Wait for database to be ready
    echo -e "${YELLOW}Waiting for database to be ready...${NC}"
    sleep 5
    
    # Check if it's ready
    for i in {1..10}; do
        if docker exec workout-db-test pg_isready -U workout_test > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Database is ready${NC}"
            return 0
        fi
        echo -e "${YELLOW}Waiting... ($i/10)${NC}"
        sleep 2
    done
    
    echo -e "${RED}✗ Database failed to start${NC}"
    return 1
}

# Function to start test redis
start_test_redis() {
    echo -e "${YELLOW}Starting test Redis...${NC}"
    docker-compose up redis-test -d
    
    # Wait for Redis to be ready
    echo -e "${YELLOW}Waiting for Redis to be ready...${NC}"
    sleep 3
    
    echo -e "${GREEN}✓ Redis is ready${NC}"
    return 0
}

# Function to run tests
run_tests() {
    local mode=$1
    
    cd backend
    
    case $mode in
        "watch")
            echo -e "${BLUE}Running tests in watch mode...${NC}"
            npm run test:e2e:watch
            ;;
        "coverage")
            echo -e "${BLUE}Running tests with coverage...${NC}"
            npm run test:e2e:cov
            ;;
        "debug")
            echo -e "${BLUE}Running tests in debug mode...${NC}"
            node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --config ./test/jest-e2e.json --runInBand
            ;;
        *)
            echo -e "${BLUE}Running E2E integration tests...${NC}"
            npm run test:e2e
            ;;
    esac
    
    local exit_code=$?
    cd ..
    return $exit_code
}

# Function to show usage
show_usage() {
    echo "Usage: ./run-tests.sh [option]"
    echo ""
    echo "Options:"
    echo "  (no option)  - Run all tests once"
    echo "  watch        - Run tests in watch mode"
    echo "  coverage     - Run tests with coverage report"
    echo "  debug        - Run tests in debug mode"
    echo "  stop         - Stop test database"
    echo "  clean        - Stop database and remove volumes"
    echo "  help         - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./run-tests.sh           # Run all tests"
    echo "  ./run-tests.sh watch     # Watch mode for development"
    echo "  ./run-tests.sh coverage  # Generate coverage report"
    exit 0
}

# Main script logic
case "${1:-}" in
    "help")
        show_usage
        ;;
    "stop")
        echo -e "${YELLOW}Stopping test database and Redis...${NC}"
        docker-compose stop db-test redis-test
        echo -e "${GREEN}✓ Test database and Redis stopped${NC}"
        exit 0
        ;;
    "clean")
        echo -e "${YELLOW}Stopping test database and Redis, removing volumes...${NC}"
        docker-compose stop db-test redis-test
        docker-compose rm -f db-test redis-test
        docker volume rm workout-app_db_test_data 2>/dev/null || true
        docker volume rm workout-app_redis_test_data 2>/dev/null || true
        echo -e "${GREEN}✓ Test database and Redis cleaned${NC}"
        exit 0
        ;;
    "watch"|"coverage"|"debug"|"")
        # Check if test database is running
        if ! check_test_db; then
            start_test_db || exit 1
        fi
        
        # Check if test Redis is running
        if ! check_test_redis; then
            start_test_redis || exit 1
        fi
        
        # Run tests
        echo ""
        run_tests "${1:-}"
        
        exit_code=$?
        echo ""
        
        if [ $exit_code -eq 0 ]; then
            echo -e "${GREEN}✓ All tests passed!${NC}"
        else
            echo -e "${RED}✗ Some tests failed${NC}"
        fi
        
        exit $exit_code
        ;;
    *)
        echo -e "${RED}Invalid option: $1${NC}"
        echo ""
        show_usage
        ;;
esac
