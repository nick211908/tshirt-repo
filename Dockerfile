FROM node:18

WORKDIR /app

# Create a non-root user with ID 1000 to match HF Spaces
RUN useradd -m -u 1000 user

# Copy dependency definitions
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Change ownership to the non-root user
RUN chown -R user:user /app

# Switch to the non-root user
USER user

# Expose the port commonly used by HF Spaces
EXPOSE 7860

# Serve the build folder
CMD ["npx", "serve", "-s", "build", "-l", "7860"]
