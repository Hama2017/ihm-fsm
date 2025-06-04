# Multi-Scale Finite State Machine API

This repository contains a FastAPI backend for creating, compiling, and deploying smart contracts based on multi-scale finite state machine specifications.

## Overview

The Multi-Scale Finite State Machine API enables:
- Creation and management of automaton contracts
- Deployment of smart contracts to an Ethereum blockchain
- Execution of functions in deployed contracts
- Management of code packages for reusable contract components
- History tracking for contract operations
- User authentication and API key management

## Prerequisites

- Python 3.11+
- Node.js 18+
- Docker and Docker Compose (optional, for containerized setup)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd apimsfm
```

### 2. Install the MSFSM library

The project depends on a local library called `msfsm` which needs to be downloaded separately:

```bash
git clone https://git.litislab.fr/blockchain/projets/smartlogilabgroup/biblioth-ques/msfsm
```

Place the msfsm directory in the project root. This library provides the core functionality for working with multi-scale finite state machines.

### 3. Install dependencies

#### Python dependencies
```bash
# Install Poetry if you don't have it yet
curl -sSL https://install.python-poetry.org | python3 -

# Install Python dependencies with Poetry
poetry install
poetry add --path ./msfsm  # Install the local msfsm library
poetry add python-dotenv pydantic-settings python-jose[cryptography] passlib[bcrypt]
```

#### Node.js dependencies
```bash
npm install
```

## Configuration

The application uses different environment files for configuration:

- `.env.dev` - Development environment settings
- `.env.docker` - Docker environment settings
- `.env.prod` - Production environment settings

Create a `.env.dev` file in the project root with settings similar to:

```
# API settings
API_PREFIX=/api/v1
API_TITLE=Multi-Scale Finite State Machine API
API_VERSION=1.0.0

# JWT settings
JWT_SECRET_KEY=your_secure_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Ethereum settings
ETHEREUM_PROVIDER_URL=http://localhost:8545
ETHEREUM_CHAIN_ID=31337
ETHEREUM_PUBLIC_KEY=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
ETHEREUM_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
ETHEREUM_SOL_VERSION=0.8.0

# API Key settings
API_KEY_HEADER_NAME=X-API-KEY
MASTER_KEY_NAME=sk_master_admin

# CORS
CORS_ALLOW_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Running the Application

### Using the development script

The easiest way to start both services (Hardhat node and FastAPI server) is to use the provided script:

```bash
chmod +x start-dev.sh
./start-dev.sh
```

This script will:
1. Set the environment to "dev"
2. Create necessary data directories
3. Start a Hardhat Ethereum node in the background
4. Launch the FastAPI server with auto-reload enabled

### Running manually

If you prefer to run the services separately:

#### 1. Start the Hardhat node

```bash
npx hardhat node
```

This will start a local Ethereum development node on port 8545.

#### 2. Start the FastAPI server

```bash
export APP_ENV=dev
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Using Docker

For a containerized setup, use Docker Compose:

```bash
docker-compose up --build
```

This will create and start two containers:
- `hardhat` - An Ethereum node based on Hardhat
- `api` - The FastAPI application

The containers are configured to:
- Use volume mounts for code and data persistence
- Expose the API on port 8000
- Expose Hardhat on port 8545
- Connect to each other using Docker's internal networking

To stop and remove the containers:

```bash
docker-compose down
```

## API Documentation

Once the application is running, the API documentation is available at:

- Swagger UI: http://localhost:8000/docs

The documentation provides a complete reference of all available endpoints, required parameters, and response formats.

## Default Credentials

The system bootstraps itself with a default admin user and API key:

- Admin User:
  - Email: `admin@localhost.com`
  - Password: `admin123`

- Master API Key: `sk_master_admin`

You must include this API key in the `X-API-KEY` header for all API requests. For authenticated endpoints, you'll also need to log in and provide the JWT token either as a cookie or in the Authorization header.

## Project Structure

- `app/` - FastAPI application code
  - `api/` - API routes and dependencies
  - `auth/` - Authentication components
  - `api_keys/` - API key management
  - `schemas/` - Pydantic data models
  - `repositories/` - Data access layer
  - `services/` - Business logic
  - `utils/` - Utility functions
  - `core/` - Core components and configuration
  - `cli/` - Command-line interface

- `data/` - Application data storage
  - `contracts/draft/` - Draft automaton contracts
  - `contracts/deployed/` - Deployed smart contracts
  - `packages/` - Package definitions
  - `history/` - Contract history logs
  - `users/` - User data and profiles
  - `api_keys/` - API key storage

- `msfsm/` - The Multi-Scale Finite State Machine library

## CLI Tools

The application includes a command-line interface for administrative tasks:

```bash
python -m app.cli.main --help
```

Available command groups:
- `admin` - Admin user and API key management
- `contract` - Smart contract management
- `utils` - Utility commands for system maintenance

Example commands:
```bash
# Reset admin credentials
python -m app.cli.main admin reset

# List all contracts
python -m app.cli.main contract list

# Check and create necessary directories
python -m app.cli.main utils check-dirs