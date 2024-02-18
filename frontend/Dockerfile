FROM node:latest

WORKDIR /frontend

COPY . /frontend

RUN cd /frontend && ls && npm install --legacy-peer-deps

EXPOSE 3000

# CMD ["npm", "run", "start"]

# docker build -t frontend .
# docker run -it -p 3000:3000 -v ./:/workspace frontend bash