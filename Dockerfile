# VoteGuard - Hugging Face Spaces Deployment
# Runs Next.js frontend + Express backend on a single container
# Next.js proxies /api/* requests to Express via rewrites

FROM node:20-alpine

WORKDIR /app

# --- BACKEND SETUP ---
COPY vote-guard-server/package*.json ./vote-guard-server/
RUN cd vote-guard-server && npm install --production

# Copy Prisma schema and generate client
COPY vote-guard-server/prisma ./vote-guard-server/prisma
RUN cd vote-guard-server && npx prisma generate

# --- FRONTEND SETUP ---
COPY package*.json ./
RUN npm install

# --- COPY ALL SOURCE CODE ---
COPY . .

# Build Next.js for production
# NEXT_PUBLIC_API_URL is empty so frontend calls go to same origin (/api/*)
# next.config.js rewrites proxy them to Express backend
ENV NEXT_PUBLIC_API_URL=""
RUN npm run build

# --- RUNTIME ENVIRONMENT ---
ENV NODE_ENV=production
ENV PORT=5001
ENV BACKEND_URL=http://localhost:5001

# Blockchain persistence (HF Persistent Storage mounts at /data)
ENV BLOCKCHAIN_DATA_PATH=/data/blockchain_data.json

# Create persistent data directory
RUN mkdir -p /data

# HF Spaces expects port 7860
EXPOSE 7860

# Start script: Express backend + Next.js frontend
# Express runs on 5001, Next.js on 7860
# Next.js proxies /api/* to Express via next.config.js rewrites
CMD sh -c "cd /app/vote-guard-server && node server.js & cd /app && npx next start -p 7860"
