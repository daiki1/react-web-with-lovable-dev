# Use official Node.js image for build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all files and build the app
COPY . .

# Inject API URL via build argument
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Use NGINX to serve the app
FROM nginx:stable-alpine

# Copy build output to NGINX public folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom NGINX config if needed (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose frontend port
EXPOSE 8081

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]