module.exports = function(RED) {
    const http = require('http');

    function HealthChecksNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        let healthCheckInstance = this.context().global.get("HealthCheckInstance");
        if (healthCheckInstance !== undefined) {
            if (healthCheckInstance === config.id) {
                this.status({});
            } else {
                this.status({ fill:"red",
                              shape:"ring",
                              text:"An instance of Health Checks is already existing!" });
                throw "An instance of Health Checks is already existing!";
            }
        } else {
            this.context().global.set("HealthCheckInstance", config.id);
            this.status({});
        }

        const requestListener = function (req, res) {
            if (req.method !== "GET") {
                //res.writeHead(500);
                //res.end('Method (' + req.method + ') not supported!\n');
                return;
            }

            if (req.url !== "/started" && req.url !== "/ready" && req.url !== "/alive") {
                //res.writeHead(500);
                //res.end('Path (' + req.url + ') not supported!\n');
                return;
            }

            // TODO: check conditions

            res.writeHead(200);
            res.end('Everything\'s fine.\n');
        }

        const server = http.createServer(requestListener);

        this.on('close', function() {
            server.close();
            if (this.context().global.get("HealthCheckInstance") === this.id) {
                this.context().global.set("HealthCheckInstance");
            }
        });

        port = (config.port !== '') ? config.port : "80";

        server.listen(port);

        if (!server.listening) {
            this.status({ fill:"red",
                          shape:"dot",
                          text:"Not listening!" });
        }
    }

    RED.nodes.registerType("health checks", HealthChecksNode, {
        settings: {
            healthChecksPort: {
                value: "",
                exportable: true
            }
        }
    });
}

