# Development stage
FROM node:20-alpine AS development

# Install pnpm
RUN npm install -g pnpm@10.4.1

# Set working directory
WORKDIR /app

# Copy package files first
COPY package.json pnpm-lock.yaml ./

# Copy patches directory
COPY patches ./patches

# Install all dependencies (including devDependencies)
# In development, allow lockfile updates when package.json changes
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Copy and set up entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=development

# Use entrypoint to ensure dependencies are installed
ENTRYPOINT ["docker-entrypoint.sh"]

# Start development server with hot-reload
CMD ["pnpm", "dev"]

# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.4.1

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy patches directory
COPY patches ./patches

# Install dependencies (use frozen lockfile in production builds)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

# Install pnpm
RUN npm install -g pnpm@10.4.1

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy patches directory
COPY patches ./patches

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/index.js"]

