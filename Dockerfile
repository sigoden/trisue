FROM node:10
WORKDIR /app
COPY . .
RUN npm install --only=prod
ENV HOST=0.0.0.0 PORT=80
CMD ["node", "server.js"]
