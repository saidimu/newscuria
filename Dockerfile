############################################################
# main Dockerfile for newscuria services
############################################################
FROM saidimu/newscuria-base:dev

# Dockerfile author/maintainer
MAINTAINER Saidimu Apale (saidimu@gmail.com)

WORKDIR /src/
ADD ./src/ /src/
RUN npm install

CMD [""]