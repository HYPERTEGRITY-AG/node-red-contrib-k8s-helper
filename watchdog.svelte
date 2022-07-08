<script context="module">
  RED.nodes.registerType("watchdog", {
		category: "Kubernetes",
        defaults: {
            contentTypeOpts: {
                value: []
            },
			countInstances: {
			    value: 0
			},
			name: {
			    value: "",
			    label: "Name",
			    icon: "tag",
			    placeholder: "Name"
			},
            condition: {
//                value:"1",
                value:"",
                required:true
            },
            fulfilled: {
                value:"true",
                required:true
            }
        },
		inputs: 1,
		outputs: 0,
		color: "#fadb6b",
        icon: function() {
            return (this.fulfilled === "true") ? "checked.png" : "unchecked.png";
        },
		label: function() {
            let node = this;

            let conditionExists = false;
            parsedConditionExist = parseInt(this.condition, 10);
            if (isNaN(parsedConditionExist)) {
                parsedConditionExist = -1;
            }

            RED.nodes.eachNode(function(n) {
                var nodeDef1 = RED.nodes.getType(n.type);
                if (nodeDef1) {
                    if (n.type === 'health checks') {
                        n.conditions.forEach(function(c) {
                            parsedIDExist = parseInt(c.id, 10);
                            if (isNaN(parsedIDExist)) {
                                parsedIDExist = -1;
                            }
                            if (parsedConditionExist == parsedIDExist) {
                                conditionExists = true;
                            }
                        });
                    }
                }
            });

            if (!conditionExists) {
                node.condition = "";
                update(node);
            }

			if (this.condition === "") {
				return "Please Select a Condition!";
			} else if (this.name) {
                return this.name;
            }

            let conditionName = "unknown condition";
            parsedCondition = parseInt(this.condition, 10);
            if (isNaN(parsedCondition)) {
                parsedCondition = -1;
            }

            RED.nodes.eachNode(function(n) {
                var nodeDef = RED.nodes.getType(n.type);
                if (nodeDef) {
                    if (n.type === 'health checks') {
                        n.conditions.forEach(function(c) {
                            parsedID = parseInt(c.id, 10);
                            if (isNaN(parsedID)) {
                                parsedID =  -1;
                            }
                            if (parsedCondition == parsedID) {
                                conditionName = c.name;
                            }
                        });
                    }
                }
            });

            return ("watchdog: " + conditionName + ((this.fulfilled === "true") ? " is fulfilled" : " is NOT fulfilled"));
		},
		oneditprepare: function () {
            var theHealthCheck = null;
            let node = this;

            let conditionExists = false;
            parsedConditionExist = parseInt(this.condition, 10);
            if (isNaN(parsedConditionExist)) {
                parsedConditionExist = -1;
            }

            RED.nodes.eachNode(function(n) {
                var nodeDef1 = RED.nodes.getType(n.type);
                if (nodeDef1) {
                    if (n.type === 'health checks') {
                        n.conditions.forEach(function(c) {
                            parsedIDExist = parseInt(c.id, 10);
                            if (isNaN(parsedIDExist)) {
                                parsedIDExist = -1;
                            }
                            if (parsedConditionExist == parsedIDExist) {
                                conditionExists = true;
                            }
                        });
                    }
                }
            });

            if (!conditionExists) {
                this.condition = "";
                update(node);
            }

            node.countInstances = 0;

            RED.nodes.eachNode(function(n) {
                var nodeDef = RED.nodes.getType(n.type);
                if (nodeDef) {
                    if (n.type === 'health checks') {
                        node.countInstances++;
                        theHealthCheck = n;
                    }
                }
            });

            var makeTypedInputOpt = function(name, id){
                return {
                    v: id,
                    l: name
                }
            }

            node.contentTypeOpts = [];
            node.contentTypeOpts.push(makeTypedInputOpt("Please Select a Condition!", ""));

            if (theHealthCheck != null) {
                theHealthCheck.conditions.forEach(function(c) {
                    node.contentTypeOpts.push(makeTypedInputOpt(c.name, c.id));
                });
            }

			render(this)
		},

		oneditsave: function () {
			update(this)
		},

		oneditcancel: function () {
			revert(this)
		}
	});
</script>

<script>
    export let node
    import { Input, Select, Callout } from 'svelte-integration-red/components'
</script>

<Input bind:node prop="name" />

{#if node.countInstances == 1}
	<Select label="Set condition" bind:node prop="condition" disabled={node.disableInput}>
	    {#each node.contentTypeOpts as { v, l }, i}
            <option value="{v}">{l}</option>
	    {/each}
    </Select>
    <Select label="to" bind:node prop="fulfilled" disabled={node.disableInput}>
        <option value="true">fulfilled</option>
        <option value="false">NOT fulfilled</option>
    </Select>
{:else}
    {#if node.countInstances == 0}
        <Callout type="error">
            <span slot="header">No health checks node found!</span>
            Please add a health checks node to the current flow(s)!
        </Callout>
    {:else}
        <Callout type="error">
            <span slot="header">More than one health checks node found!</span>
            In sum, {node.countInstances} instances of health checks nodes are found within all flows and subflows.<br>Please reduce the number of health checks nodes to exactly one!
        </Callout>
    {/if}
{/if}
