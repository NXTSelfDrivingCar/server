FROM node:16

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package*.json ./

RUN npm install

COPY . ./

EXPOSE 5000

CMD [ "node", "httpServer.js" ]