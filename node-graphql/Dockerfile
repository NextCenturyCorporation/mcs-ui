FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Create Arguments
ARG PORT_ARG=9100
ENV PORT=$PORT_ARG

ARG AMD_MONGO_TOOLS_URL=https://fastdl.mongodb.org/tools/db/mongodb-database-tools-debian10-x86_64-100.7.0.deb
ARG ARM_MONGO_TOOLS_URL=https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu2004-arm64-100.7.0.deb

ARG BUILD_ENV=AMD

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

RUN if [ "$BUILD_ENV" = "ARM" ] ; then \
    wget $ARM_MONGO_TOOLS_URL && apt install ./mongodb-database-tools-*.deb &&  rm -f mongodb-database-tools-*.deb ; \
else \
    wget $AMD_MONGO_TOOLS_URL && apt install ./mongodb-database-tools-*.deb && rm -f mongodb-database-tools-*.deb ; \
fi

RUN apt-get update || : && apt-get install python3 python3-pip python3-boto3 -y
RUN pip3 install pymongo

# Bundle app source
COPY . .

EXPOSE $PORT_ARG
CMD [ "node", "server.accounts.js" ]