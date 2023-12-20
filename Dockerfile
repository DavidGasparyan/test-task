FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install -g yarn
RUN yarn

COPY ./src .

CMD ["node", "start", "main.js"]
