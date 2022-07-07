# Health Checks

This node offers health checks for flow(s) running in a containerized environment.

When added to a flow, this node will start an HTTP server, listening on a defined port (default: 80) and providing three paths: `/started`, `/ready` and `/alive`.


Please note that only one health checks node can be defined within ALL flows and subflows!



### Integration

This node offers three paths: `/started`, `/ready` and `/alive` at a configured port.  
These paths can be used as HTTP probes in a containerized environment.  
Each of the paths will check for one or more of the defined **conditions** and return a `200 OK` or `500 Internal Error` if at least one of the conditions failed. Additionally, the body will list the condition(s) that failed.

Read more about kubernetes Probes [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes).

### Example

Let's think about a flow, subscribing to an MQTT message broker (using an **mqtt in node**).  
A **health checks node** will then define a condition, named for example 'MQTT connected' and add this condition to all 3 probes.  
A watchdog will check for the **mqtt in node's** status (one of 'connected', 'connecting' and 'disconnected') and its color ("green" if connected) in particular. On a status change, the health checks node's condition will be set accordingly using a **switch node**.  
The container framework will frequently call the container's HTTP probes and decide what to do, if a check fails.