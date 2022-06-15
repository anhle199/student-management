# ------------------------- Start of building phase -------------------------
# Builds an evironment to compile this app.

# Initializes node v16.15.1 as a base image, named `builder`.
FROM node:16.15.1-alpine AS builder

# Author information.
LABEL author.name="Le Hoang Anh"
LABEL author.email="lehoanganh.le2001@gmail.com"

# Create the `/app` directory in the image.
WORKDIR /app

# Install typescript with --quite and -g modes.
RUN npm install --quite typescript -g

# Copy the package.json to `app` directory in the image's filesystem.
COPY ./package.json ./
COPY ./package-lock.json ./

# Install all dependencies.
RUN npm install

# Copy all directories/files (except those declared at the .dockerignore file)
# from directory where the Dockerfile is stored to the image's filesystem.
COPY . .

RUN npm run build

# Remove all development dependencies.
RUN npm prune --production
# ------------------------- End of building phase -------------------------


# -------------------------------------------------------------------------
FROM node:16.15.1-alpine

# Change working directory to `app`.
WORKDIR /app

# Copy necessary directories/files from builder stage
# to current working directory in the image's filesystem.
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/index.js"]
# -------------------------------------------------------------------------
