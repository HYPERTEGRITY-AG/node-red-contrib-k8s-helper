module.exports = function(RED) {
    function WatchDogNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var theHealthCheck = null;
        var countInstances = 0;
        const globalContext = node.context().global;

        RED.nodes.eachNode(function(n) {
            if (n.type === 'health checks') {
                countInstances++;
                theHealthCheck = n;
            }
        });

        if (countInstances == 1) {
            node.status({});
        } else if (countInstances == 0) {
            node.status({ fill:"red",
                          shape:"dot",
                          text:"No health checks node found!" });
         } else {
            node.status({ fill:"red",
                          shape:"dot",
                          text:"Found more than one health checks node. Instances: " + countInstances });
        }

        node.on('close', function() {
            // TODO: Inform THE health checks node
        });

        node.on('input', function(msg) {
            let conditions = globalContext.get("HEALTH_CHECKS_CONDITIONS");

            parsedCondition = parseInt(config.condition, 10);
            if (isNaN(parsedCondition)) {
                parsedCondition = -1;
            }

            conditions.forEach((e) => {
                parsedID = parseInt(e.id, 10);
                if (isNaN(parsedID)) {
                    parsedID =  -1;
                }
                if (parsedCondition == parsedID) {
                    e.status = (config.fulfilled === "true") ? true : false;
                }
            });

            globalContext.set("HEALTH_CHECKS_CONDITIONS", conditions);

        });
    }

    RED.nodes.registerType("watchdog", WatchDogNode, {
    });
}

