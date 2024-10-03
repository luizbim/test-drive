#!/bin/bash

# Running the installer locally
npm install

# Building the project
npx nx run-many -t build && \
docker compose -f deploy-local.yml down && \
docker compose -f deploy-local.yml build && \
docker compose -f deploy-local.yml up

