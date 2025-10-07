FROM node:20

WORKDIR /usr/src/app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy rest of the frontend code
COPY . .

# Create a startup script that checks for dependency changes
RUN echo '#!/bin/sh\nif [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then\n  echo "Installing dependencies..."\n  npm install\nfi\nexec "$@"' > /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]