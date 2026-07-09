# Official Node.js Image
FROM node:24-slim

# Working directory in Container
WORKDIR /app

# copy and install dependencies
COPY package*.json ./
RUN npm install

# copy source code
COPY . .

# expose Port
EXPOSE 3000

# start the application
CMD ["node", "server.js"]