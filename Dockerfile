
# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Start the application
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
