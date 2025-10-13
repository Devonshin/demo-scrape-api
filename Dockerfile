# Dockerfile
FROM node:20-alpine AS development

# Install dumb-init for proper process handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=development && npm cache clean --force

# Copy source code
COPY . .

# Change ownership to node user
RUN chown -R node:node /usr/src/app
USER node

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application in development mode
CMD ["npm", "run", "start:dev"]


# Production stage
FROM node:20-alpine AS production

# Install dumb-init
RUN apk add --no-cache dumb-init

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from development stage or build
COPY --chown=node:node dist ./dist

# Switch to node user
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health/liveness', (r) => {if(r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init for proper process handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]