############################################################
# main Dockerfile for newscuria services
############################################################
FROM newscuria/base:latest

# Dockerfile author/maintainer
MAINTAINER Saidimu Apale (saidimu@gmail.com)

WORKDIR /src/
ADD ./src/ /src/
RUN npm install

CMD [""]