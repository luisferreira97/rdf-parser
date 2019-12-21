FROM node:10

RUN mkdir -p /app
WORKDIR /app

EXPOSE 7005

CMD npm install && npm start