# Development environment for FinVault React app
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Install dev dependencies
RUN npm install -D

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]