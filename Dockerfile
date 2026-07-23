FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy backend
COPY backend ./backend

# Copy frontend
COPY frontend ./frontend

# Install dependencies
RUN npm run install:all

# Build frontend
RUN npm run build:client

# Expose port
EXPOSE 5000

# Start backend server
CMD ["npm", "start"]
