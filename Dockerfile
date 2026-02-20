FROM node:20-alpine

WORKDIR /app

# Copy root package files and install Next.js dependencies
COPY package*.json ./
RUN npm install

# Copy backend package files and install backend dependencies
COPY vote-guard-server/package*.json ./vote-guard-server/
RUN cd vote-guard-server && npm install

# Copy Prisma schema and generate client
COPY vote-guard-server/prisma ./vote-guard-server/prisma
RUN cd vote-guard-server && npx prisma generate

# Copy all source code
COPY . .

# Build Next.js for production
RUN npm run build

# Create a startup script that runs both services
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'cd /app/vote-guard-server && node server.js &' >> /app/start.sh && \
    echo 'cd /app && npm start' >> /app/start.sh && \
    chmod +x /app/start.sh

# Hugging Face Spaces expects port 7860
ENV PORT=7860
ENV NEXT_PORT=7860
ENV BACKEND_PORT=5001
EXPOSE 7860

CMD ["/app/start.sh"]
