FROM node:20

WORKDIR /usr/src/app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy rest of the backend code
COPY . .

# Start NestJS in development mode
CMD ["npm", "run", "start:dev"]
