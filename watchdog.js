module.exports = function(RED) {
    function WatchDogNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.status({ fill:"green",
                      shape:"dot",
                      text:"Everything's fine." });

        this.on('close', function() {
        });
    }

    RED.nodes.registerType("watchdog", WatchDogNode, {
        settings: {
            watchdogPort: {
                value: "",
                exportable: true
            }
        }
    });
}

