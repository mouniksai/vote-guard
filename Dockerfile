# /Dockerfile (Frontend)
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (use npm install to avoid issues if lockfile is out of sync)
RUN npm install

# Copy all files
COPY . .

# Build Next.js app
# The NEXT_PUBLIC_API_URL will be injected at runtime or build time
RUN npm run build

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Hugging Face Spaces expose port 7860
ENV PORT 7860
EXPOSE 7860

# Start Next.js server
CMD ["npm", "start"]
