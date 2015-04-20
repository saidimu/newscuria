############################################################
# main Dockerfile for newscuria services
############################################################
FROM node:0.10.38

# Dockerfile author/maintainer
MAINTAINER Saidimu Apale (saidimu@gmail.com)

WORKDIR /src/
ADD ./src/ /src/

## See "Making components first-class" in http://strongloop.com/strongblog/modular-node-js-express/
RUN npm install && \
    ln -s /src/lib/ /src/node_modules/_

CMD [""]
