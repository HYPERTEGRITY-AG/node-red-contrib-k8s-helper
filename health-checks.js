module.exports = function(RED) {
    const http = require('http');

    function isIdRelevant(arr, id) {
        let ret = false;

        arr.forEach((e) => {
            if (e === id) {
                ret = true;
            }
        });

        return ret;
    }

    function handleProbe(conditions, name, arr, res) {
        let txt = (name + ' failed!\nCondition(s) ');
        let del = '';
        let okay = true;

        conditions.forEach((e) => {
            if (!e.status) {
                if (isIdRelevant(arr, e.id)) {
                    txt = txt + (del + e.name);
                    del = ', ';
                    okay = false;
                }
            }
        });

        if (!okay) {
            txt = txt + ' failed!\n';
            res.writeHead(500);
            res.end(txt);
        } else {
            res.writeHead(200);
            res.end(name + ' succeeded.\n');
        }

        return;
    }

    function HealthChecksNode(config) {
        RED.nodes.createNode(this, config)
        const node = this
        node.name = config.name
        const globalContext = node.context().global;

        // first of make a global copy of all conditions
        globalContext.set("HEALTH_CHECKS_CONDITIONS", config.conditions);

        let healthCheckInstance = globalContext.get("HealthCheckInstance");
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
            globalContext.set("HealthCheckInstance", config.id);
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

            // Check conditions
            let conditions = globalContext.get("HEALTH_CHECKS_CONDITIONS");

            if (req.url === "/started") {
                handleProbe(conditions, 'Startup-Probe', config.started, res);
            } else if (req.url === "/ready") {
                handleProbe(conditions, 'Readiness-Probe', config.ready, res);
            } else if (req.url === "/alive") {
                handleProbe(conditions, 'Liveness-Probe', config.alive, res);
            }
        }

        const server = http.createServer(requestListener);

        this.on('close', function() {
            server.close();
            if (globalContext.get("HealthCheckInstance") === this.id) {
                globalContext.set("HealthCheckInstance");
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

