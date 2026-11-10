FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
EXPOSE 3000
# Projeto usa ts-node-dev para executar TypeScript; porta só interna.
CMD ["npm", "run", "dev"]
