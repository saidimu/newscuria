############################################################
# Cassandra Dockerfile for nuzli services
############################################################
#
# Expects CASSANDRA_CONFIG and CASSANDRA_CLUSTERNAME env variables to be set.
# If either CASSANDRA_CONFIG or CASSANDRA_CLUSTERNAME is not set, startup process is aborted

FROM nuzli/base:latest

USER root

# Add DataStax sources
ADD datastax_key /tmp/datastax_key
RUN apt-key add /tmp/datastax_key
RUN echo "deb http://debian.datastax.com/community stable main" > /etc/apt/sources.list.d/datastax.list

# Install Cassandra 2.0.x
RUN apt-get -qq update > /dev/null && \
	apt-get -y install cassandra
#  apt-get -y install cassandra=2.0.10 dsc20
#  apt-get -y install cassandra=2.0.10 dsc20=2.0.10-1

# Place single-node startup-config script
ADD scripts/cassandra-singlenode.sh /usr/local/bin/cassandra-singlenode

# Necessary since cassandra is trying to override the system limitations
# See https://groups.google.com/forum/#!msg/docker-dev/8TM_jLGpRKU/dewIQhcs7oAJ
RUN rm -f /etc/security/limits.d/cassandra.conf

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

EXPOSE 7199 7000 7001 9160 9042 22 8012 61621

# Start Cassandra
CMD ["cassandra-singlenode"]
