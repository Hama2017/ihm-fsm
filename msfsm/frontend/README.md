<div align="center">
  <img src="https://i.postimg.cc/zBG7bnM4/logo.png" alt="Smart Legal Contract Logo" width="280"/>
  <h1>Frontend — Smart Legal Contract</h1>
  <p><em>Vue 3 + Vite powered frontend for multi-scale smart legal contracts</em></p>
</div>
<div align="center">

[![last commit](https://img.shields.io/github/last-commit/your-org/smart-legal-frontend?style=flat-square)](https://github.com/your-org/smart-legal-frontend)
[![license](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](./LICENSE)

> A user-friendly and powerful interface for creating, editing, and deploying Smart Legal Contracts powered by multi-scale finite state machines.  
> 🔒 Secure by design — ⚙️ Developer-friendly — 🎨 Smooth UI/UX

</div>


## Prerequisites

- **Node.js** (v18+ recommended)  
- **npm** or **yarn**  
- **Git**

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Frontend
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

---

## Configuration

### Environment Variables

Create a `.env` file at the root of the frontend project:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_API_ORIGIN_URL=http://localhost:8000

# API Key for authentication
VITE_API_KEY=pk_master_admin
```

### API Configuration

- **API Base URL:** `http://localhost:8000/api/v1`  
- **Authentication:** HTTP-only cookies + API key  
- **CORS:** Configured to accept cross-origin requests

---

## Development

### Start development server

```bash
npm run dev
# or
yarn dev
```

> App will be running at: `http://localhost:3000`

### Available scripts

```bash
npm run dev         # Development mode
npm run build       # Build for production
npm run preview     # Preview the production build
```

---

## Docker

### Build & run with Docker

```bash
# Build image
docker build -t smart-legal-frontend .

# Run container
docker run -p 3000:80 smart-legal-frontend
```

### Using Docker Compose

```bash
# Start the frontend service
docker-compose up frontend

# Start in detached mode
docker-compose up -d frontend
```

