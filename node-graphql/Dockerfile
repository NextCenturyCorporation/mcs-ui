FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Create Arguments
ARG PORT_ARG=9100
ENV PORT=$PORT_ARG

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

RUN apt-get update || : && apt-get install python3 python3-pip mongo-tools python3-boto3 -y
RUN pip3 install pymongo

# Bundle app source
COPY . .

EXPOSE $PORT_ARG
CMD [ "node", "server.accounts.js" ]