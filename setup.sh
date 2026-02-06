#!/bin/bash
set -e

echo "╔══════════════════════════════════════════════╗"
echo "║       StellarPay - Quick Setup Script        ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "   Install from: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current: $(node -v)"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"

# Start PostgreSQL via Docker (optional)
if command -v docker &> /dev/null; then
    echo ""
    echo "Starting PostgreSQL via Docker..."
    docker compose up -d postgres 2>/dev/null || docker-compose up -d postgres 2>/dev/null || echo "⚠ Docker not available, ensure PostgreSQL is running manually"
    sleep 3
fi

# Backend setup
echo ""
echo "Setting up Backend..."
cd backend

if [ ! -f .env ]; then
    cp .env.example .env
    # Set default Docker DB URL
    sed -i 's|postgresql://user:password@localhost:5432/stellarpay?schema=public|postgresql://stellarpay:stellarpay_dev@localhost:5432/stellarpay?schema=public|' .env 2>/dev/null || true
    echo "  ✓ Created .env (edit if using a different database)"
fi

npm install
echo "  ✓ Dependencies installed"

npx prisma generate
echo "  ✓ Prisma client generated"

npx prisma migrate dev --name init --skip-seed 2>/dev/null || npx prisma db push
echo "  ✓ Database migrated"

cd ..

# Frontend setup
echo ""
echo "Setting up Frontend..."
cd frontend

if [ ! -f .env ]; then
    cp .env.example .env
    echo "  ✓ Created .env"
fi

npm install
echo "  ✓ Dependencies installed"

cd ..

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║              Setup Complete!                 ║"
echo "╠══════════════════════════════════════════════╣"
echo "║                                              ║"
echo "║  Start backend:   cd backend && npm run dev  ║"
echo "║  Start frontend:  cd frontend && npm run dev ║"
echo "║                                              ║"
echo "║  Backend:  http://localhost:3001              ║"
echo "║  Frontend: http://localhost:5173              ║"
echo "║                                              ║"
echo "║  Install Freighter wallet extension to       ║"
echo "║  connect and start creating invoices.        ║"
echo "║                                              ║"
echo "╚══════════════════════════════════════════════╝"
