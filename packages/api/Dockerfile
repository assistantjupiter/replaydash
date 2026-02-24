# Multi-stage build for optimal image size
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/

# Install dependencies
RUN npm ci --workspace=@replaydash/api

# Copy source code
COPY packages/api ./packages/api
COPY tsconfig.json ./

# Generate Prisma client
WORKDIR /app/packages/api
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files and install production dependencies only
COPY --chown=nestjs:nodejs package*.json ./
COPY --chown=nestjs:nodejs packages/api/package*.json ./packages/api/

RUN npm ci --workspace=@replaydash/api --omit=dev

# Copy built application and Prisma files
COPY --from=builder --chown=nestjs:nodejs /app/packages/api/dist ./packages/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/api/prisma ./packages/api/prisma
COPY --from=builder --chown=nestjs:nodejs /app/packages/api/node_modules/.prisma ./packages/api/node_modules/.prisma

# Set working directory to API package
WORKDIR /app/packages/api

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/main.js"]
