module.exports = function(RED) {
    function HealthChecksNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.error("config.port: " + config.port);

        this.isWorking = false;

        let healthCheckInstance = this.context().global.get("HealthCheckInstance");
        if (healthCheckInstance !== undefined) {
            if (healthCheckInstance === config.id) {
                this.status({});
                this.isWorking = true;
            } else {
                this.status({ fill:"red",
                              shape:"ring",
                              text:"An instance of Health Check is already existing!" });
                throw "An instance of Health Check is already exiting!";
            }
        } else {
            this.context().global.set("HealthCheckInstance", config.id);
            this.status({});
            this.isWorking = true;
        }

        this.on('close', function() {
            if (this.context().global.get("HealthCheckInstance") === this.id) {
                this.context().global.set("HealthCheckInstance");
            }
        });
    }

    RED.nodes.registerType("health-checks", HealthChecksNode, {
        settings: {
            healthChecksPort: {
                value: "",
                exportable: true
            }
        }
    });
}

