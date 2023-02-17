FROM node:18-bullseye-slim

ADD . /app
WORKDIR /app

RUN npm i nodemon parcel -g

CMD ["npm", "start"]