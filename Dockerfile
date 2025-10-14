# Dockerfile
FROM node:20-alpine AS local

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
CMD ["npm", "run", "start:local"]
