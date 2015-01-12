#!/usr/bin/env bash

# Get running container's IP
IP=`hostname --ip-address`

# Check for configuration file location
if [ -z "$CASSANDRA_CONFIG" ]; then
        echo "No config file location specified. Exiting..."
        echo
        exit -1
fi


# Setup cluster name
if [ -z "$CASSANDRA_CLUSTERNAME" ]; then
        echo "No cluster name specified. Exiting..."
	echo
	exit -1
else
        sed -i -e "s/^cluster_name:.*/cluster_name: $CASSANDRA_CLUSTERNAME/" $CASSANDRA_CONFIG/cassandra.yaml
fi

LISTEN_ADDRESS=$IP

# Value of 'seeds' needs to be same as of 'listen_address'
sed -i -e "s/- seeds:.*/- seeds: $LISTEN_ADDRESS/" $CASSANDRA_CONFIG/cassandra.yaml

# Dunno why zeroes here
# sed -i -e "s/^rpc_address.*/rpc_address: 0.0.0.0/" $CASSANDRA_CONFIG/cassandra.yaml
sed -i -e "s/^rpc_address.*/rpc_address: $LISTEN_ADDRESS/" $CASSANDRA_CONFIG/cassandra.yaml

# Listen on IP:port of the container
sed -i -e "s/^listen_address.*/listen_address: $LISTEN_ADDRESS/" $CASSANDRA_CONFIG/cassandra.yaml

# Pointless in one-node cluster, saves about 5 sec waiting time
echo "JVM_OPTS=\"\$JVM_OPTS -Dcassandra.skip_wait_for_gossip_to_settle=0\"" >> $CASSANDRA_CONFIG/cassandra-env.sh

# Most likely not needed
echo "JVM_OPTS=\"\$JVM_OPTS -Djava.rmi.server.hostname=$IP\"" >> $CASSANDRA_CONFIG/cassandra-env.sh

cassandra -f
