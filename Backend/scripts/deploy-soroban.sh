#!/bin/bash

# Tiba Cloud - Soroban Contract Deployment Script
# This script builds and deploys the payment recording smart contract to Stellar/Soroban

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NETWORK="testnet"  # Change to "mainnet" for production
CONTRACT_DIR="contracts"
BUILD_DIR="target/wasm32-unknown-unknown/release"
CONTRACT_NAME="tiba_cloud_payment_contract"
WASM_FILE="${CONTRACT_NAME}.wasm"

# Environment variables required
REQUIRED_VARS=(
    "STELLAR_SECRET_KEY"
    "STELLAR_PUBLIC_KEY"
)

echo -e "${BLUE}=== Tiba Cloud Soroban Contract Deployment ===${NC}"
echo

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."

    if ! command -v soroban &> /dev/null; then
        print_error "Soroban CLI is not installed. Please install it first:"
        echo "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
        echo "cargo install --locked soroban-cli"
        exit 1
    fi

    if ! command -v cargo &> /dev/null; then
        print_error "Cargo is not installed. Please install Rust first:"
        echo "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
        exit 1
    fi

    print_status "All dependencies found!"
}

# Check environment variables
check_environment() {
    print_status "Checking environment variables..."

    for var in "${REQUIRED_VARS[@]}"; do
        if [[ -z "${!var}" ]]; then
            print_error "Environment variable $var is not set"
            echo "Please set it in your .env file or export it:"
            echo "export $var=your_value_here"
            exit 1
        fi
    done

    print_status "Environment variables OK!"
}

# Setup Soroban network
setup_network() {
    print_status "Setting up Soroban network configuration..."

    if [ "$NETWORK" = "testnet" ]; then
        soroban config network add \
            --global testnet \
            --rpc-url https://soroban-testnet.stellar.org:443 \
            --network-passphrase "Test SDF Network ; September 2015"
    else
        soroban config network add \
            --global mainnet \
            --rpc-url https://soroban-mainnet.stellar.org:443 \
            --network-passphrase "Public Global Stellar Network ; September 2015"
    fi

    print_status "Network configuration complete!"
}

# Configure identity
setup_identity() {
    print_status "Setting up Soroban identity..."

    # Import the secret key as identity
    echo "$STELLAR_SECRET_KEY" | soroban config identity generate \
        --global tiba-deployer --seed-phrase

    # Fund the account if on testnet
    if [ "$NETWORK" = "testnet" ]; then
        print_status "Funding testnet account..."
        soroban config identity fund tiba-deployer --network testnet || {
            print_warning "Failed to fund account automatically. Please fund manually:"
            echo "https://laboratory.stellar.org/#account-creator?network=test"
            echo "Public Key: $STELLAR_PUBLIC_KEY"
        }
    fi

    print_status "Identity setup complete!"
}

# Build the contract
build_contract() {
    print_status "Building Soroban contract..."

    cd "$CONTRACT_DIR"

    # Add wasm32 target if not present
    rustup target add wasm32-unknown-unknown

    # Build the contract
    cargo build --target wasm32-unknown-unknown --release

    # Optimize the WASM file
    if [ -f "$BUILD_DIR/$WASM_FILE" ]; then
        print_status "Contract built successfully!"
        ls -la "$BUILD_DIR/$WASM_FILE"
    else
        print_error "Contract build failed - WASM file not found"
        exit 1
    fi

    cd ..
}

# Deploy the contract
deploy_contract() {
    print_status "Deploying contract to $NETWORK..."

    WASM_PATH="$CONTRACT_DIR/$BUILD_DIR/$WASM_FILE"

    # Deploy the contract
    CONTRACT_ADDRESS=$(soroban contract deploy \
        --wasm "$WASM_PATH" \
        --source tiba-deployer \
        --network "$NETWORK")

    if [ -n "$CONTRACT_ADDRESS" ]; then
        print_status "Contract deployed successfully!"
        echo -e "${GREEN}Contract Address: $CONTRACT_ADDRESS${NC}"

        # Save contract address to file
        echo "STELLAR_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" > ../contract_address.env
        echo "STELLAR_PAYMENT_CONTRACT=$CONTRACT_ADDRESS" >> ../contract_address.env

        print_status "Contract address saved to contract_address.env"
    else
        print_error "Contract deployment failed"
        exit 1
    fi
}

# Initialize the contract
initialize_contract() {
    print_status "Initializing contract..."

    # Initialize with the deployer as admin
    soroban contract invoke \
        --id "$CONTRACT_ADDRESS" \
        --source tiba-deployer \
        --network "$NETWORK" \
        -- \
        initialize \
        --admin "$STELLAR_PUBLIC_KEY"

    print_status "Contract initialized successfully!"
}

# Test the contract
test_contract() {
    print_status "Testing contract functionality..."

    # Get contract info
    CONTRACT_INFO=$(soroban contract invoke \
        --id "$CONTRACT_ADDRESS" \
        --source tiba-deployer \
        --network "$NETWORK" \
        -- \
        get_contract_info)

    echo "Contract Info: $CONTRACT_INFO"

    # Test payment count (should be 0)
    PAYMENT_COUNT=$(soroban contract invoke \
        --id "$CONTRACT_ADDRESS" \
        --source tiba-deployer \
        --network "$NETWORK" \
        -- \
        get_payment_count)

    echo "Initial Payment Count: $PAYMENT_COUNT"

    print_status "Contract test completed!"
}

# Main deployment process
main() {
    echo -e "${BLUE}Starting deployment process...${NC}"
    echo

    check_dependencies
    check_environment
    setup_network
    setup_identity
    build_contract
    deploy_contract
    initialize_contract
    test_contract

    echo
    echo -e "${GREEN}=== Deployment Complete! ===${NC}"
    echo -e "${GREEN}Contract Address: $CONTRACT_ADDRESS${NC}"
    echo -e "${GREEN}Network: $NETWORK${NC}"
    echo
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Add the contract address to your .env file:"
    echo "   STELLAR_CONTRACT_ADDRESS=$CONTRACT_ADDRESS"
    echo "2. Update your Laravel application configuration"
    echo "3. Test the integration with your M-Pesa callback"
    echo
    echo -e "${BLUE}Contract functions available:${NC}"
    echo "- record_payment: Record M-Pesa payments on blockchain"
    echo "- get_payment: Retrieve payment by checkout request ID"
    echo "- update_payment_status: Update payment status"
    echo "- get_payment_count: Get total payments recorded"
    echo "- verify_payment_exists: Check if payment exists"
}

# Handle script arguments
case "${1:-deploy}" in
    "build")
        build_contract
        ;;
    "deploy")
        main
        ;;
    "test")
        test_contract
        ;;
    "clean")
        print_status "Cleaning build artifacts..."
        cd "$CONTRACT_DIR"
        cargo clean
        cd ..
        print_status "Clean complete!"
        ;;
    *)
        echo "Usage: $0 [build|deploy|test|clean]"
        echo "  build  - Only build the contract"
        echo "  deploy - Full deployment process (default)"
        echo "  test   - Test deployed contract"
        echo "  clean  - Clean build artifacts"
        exit 1
        ;;
esac
