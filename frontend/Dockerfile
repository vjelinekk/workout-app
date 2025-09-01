FROM node:20

WORKDIR /usr/src/app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy rest of the frontend code
COPY . .

# Start Next.js in development mode
CMD ["npm", "run", "dev"]