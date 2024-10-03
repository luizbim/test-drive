FROM node:20.17-alpine3.19

WORKDIR /service

COPY ./dist/apps/backend/scheduler-service/ .

ENV PORT=3000
EXPOSE ${PORT}
RUN npm install --omit=dev

CMD ["node", "main.js"]