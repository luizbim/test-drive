FROM nginx:1.23.3-alpine

WORKDIR /service

COPY ./dist/apps/frontend/scheduler-webapp/ ./
RUN rm -Rf ./docker

COPY ./dist/apps/frontend/scheduler-webapp/docker/nginx/default.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]