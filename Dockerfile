FROM node:12
WORKDIR /app
RUN npx create-react-app .
EXPOSE 3000
CMD npm start
