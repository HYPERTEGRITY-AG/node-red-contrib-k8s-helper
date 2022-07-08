<script context="module">
  RED.nodes.registerType("health checks", {
		category: "Kubernetes",
		defaults: {
			countInstances: {
			    value: 0
			},
			name: {
			    value: "",
			    label: "Name",
			    icon: "tag",
			    placeholder: "Name"
			},
            port: {
                value:"",
                label: "Port",
                icon: "hashtag",
                placeholder: "80",
                type:"number",
                validate:function(v) {
                    return (v === "" || (!isNaN(v) && v >= 1 && v <= 65535));
                },
                required:false
            },
            sequence: {
                value: 2
            },
            conditions: {
//                value: [ { name:"MQTT connected", id:"1", status:false }, { name:"DB tables created", id:"2", status:false } ]
                value: []
            },
            started: {
//                value: [ "2" ]
                value: []
            },
            ready: {
//                value: [ "1" ]
                value: []
            },
            alive: {
//                value: [ "1", "2" ]
                value: []
            }
		},
		inputs: 0,
		outputs: 0,
		color: "#9ad78e",
		icon: "hb.png",
        label: function() {
          if (this.name) return this.name;
                return "health checks";
        },
		oneditprepare: function () {
            let node = this;

            node.countInstances = 0;

            RED.nodes.eachNode(function(n) {
                var nodeDef = RED.nodes.getType(n.type);
                if (nodeDef) {
                    if (n.type === 'health checks') {
                        node.countInstances++;
                    }
                }
            });

			render(this, { minWidth: "650px" })
		},
		oneditsave: function () {
			update(this)

            RED.nodes.eachNode(function(n) {
                var nodeDef = RED.nodes.getType(n.type);
                if (nodeDef) {
                    if (n.type === 'watchdog') {
                        update(n);
                        //alert("updated");
                    }
                }
            });
		},
		oneditcancel: function () {
			revert(this)
		}
	});
</script>

<script>
    // get your node variable from extern and import the needed components from SIR
    export let node
    import { Input, Button, TabbedPane, TabContent, EditableList, Row, Callout } from 'svelte-integration-red/components'

//    const myButtonFunc = () => alert('The button was pressed')

    // Our tabs definitions
    let tabs = {
        "conditions": { name: "Conditions", icon: "list" },
        "startup": { name: "Startup-Probe", icon: "floppy-o" },
        "readiness": { name: "Readiness-Probe", icon: "check" },
        "liveness": { name: "Liveness-Probe", icon: "heartbeat" }
    }

	function addCondition() {
	    node.sequence = (node.sequence + 1)

		node.conditions = [...node.conditions, { name:"New Condition", id:"" + (node.sequence), status:false } ]
	}

	function removeCondition(e) {
	    changeIdStatus(node.started, e.id, false)
 	    changeIdStatus(node.ready, e.id, false)
  	    changeIdStatus(node.alive, e.id, false)
	}

    function isIdContained(array, id) {
        let ret = false

        array.forEach((e) => {
            if (e === id) {
                ret = true
            }
        });

        return ret
    }

    function changeIdStatus(array, id, status, summary) {
        if (status) {
            // add 'id' to 'array'
            array.push(id)
        } else {
            // Remove 'id' from 'array'
            for (var i = 0; i < array.length; i++) {
                if (array[i] === id) {
                    array.splice(i, 1);
                }
            }
        }

        document.getElementById(summary).innerHTML = getSummary(array.length);
    }

    function getSummary(num) {
        summary = "";

        if (num == 0) {
            summary = "This probe will ALWAYS succeed, since no condition is checked.";
        } else if (num == node.conditions.length) {
            summary = "This probe will succeed if ALL conditions are fulfilled.";
        } else {
            summary = "This probe will succeed if the checked condition(s) is/are fulfilled.";
        }

        return summary;
    }
</script>

<Input bind:node prop="name" />
<Input bind:node prop="port" />

{#if node.countInstances == 1}
    <TabbedPane bind:tabs>
        <TabContent tab="conditions" iconClass="tag">
            <EditableList id:conditionsList
                          bind:elements={node.conditions}
                          let:element={condition}
                          let:index
                          removable
                          addButton
                          height=470
                          disabled={node.disableInput}
                          on:add={addCondition}
                          on:remove={(e) => removeCondition(e.detail.removed)}>
                <Input inline
                       maximize
                       value={condition.name}
                       on:change={(e) => node.conditions[index].name = e.detail.value}>
                </Input>
    <!--            <Input inline maximize value={condition.id} disabled=true></Input> -->
            </EditableList>

        </TabContent>

        <TabContent tab="startup">
            {#if node.conditions.length > 0}
                <EditableList id:startupList
                              bind:elements={node.conditions}
                              height=470
                              disabled={node.disableInput}
                              let:element={condition}
                              let:index>
                    <div class:required={true} style="display:flex;">
                        <div style="min-width: 99px;">
                            <Input type="checkbox"
                                   label={' ' + condition.name}
                                   value={isIdContained(node.started, node.conditions[index].id)}
                                   on:change={(e) => (changeIdStatus(node.started,
                                                                     node.conditions[index].id,
                                                                     e.detail.value,
                                                                     "startupSummary"))}/>
                        </div>
                    </div>
                </EditableList>
                <Callout type="success">
                    <div id="startupSummary">{getSummary(node.started.length)}</div>
                </Callout>
            {:else}
                <div style="margin-top: 30px; font-weight: bold;">No Conditions found!</div>
            {/if}
        </TabContent>

        <TabContent tab="readiness">
            {#if node.conditions.length > 0}
                <EditableList id:readinessList
                              bind:elements={node.conditions}
                              height=470
                              disabled={node.disableInput}
                              let:element={condition}
                              let:index>
                    <div class:required={true} style="display:flex;">
                        <div style="min-width: 99px;">
                            <Input type="checkbox"
                                   label={' ' + condition.name}
                                   value={isIdContained(node.ready, node.conditions[index].id)}
                                   on:change={(e) => (changeIdStatus(node.ready,
                                                                     node.conditions[index].id,
                                                                     e.detail.value,
                                                                     "readinessSummary"))}/>
                        </div>
                    </div>
                </EditableList>
                <Callout type="success">
                    <div id="readinessSummary">{getSummary(node.ready.length)}</div>
                </Callout>
            {:else}
                <div style="margin-top: 30px; font-weight: bold;">No Conditions found!</div>
            {/if}
        </TabContent>

        <TabContent tab="liveness">
            {#if node.conditions.length > 0}
                <EditableList id:livenessList
                              bind:elements={node.conditions}
                              height=470
                              disabled={node.disableInput}
                              let:element={condition}
                              let:index>
                    <div class:required={true} style="display:flex;">
                        <div style="min-width: 99px;">
                            <Input type="checkbox"
                                   label={' ' + condition.name}
                                   value={isIdContained(node.alive, node.conditions[index].id)}
                                   on:change={(e) => (changeIdStatus(node.alive,
                                                                     node.conditions[index].id,
                                                                     e.detail.value,
                                                                     "livenessSummary"))}/>
                        </div>
                    </div>
                </EditableList>
                <Callout type="success">
                    <div id="livenessSummary">{getSummary(node.alive.length)}</div>
                </Callout>
            {:else}
                <div style="margin-top: 30px; font-weight: bold;">No Conditions found!</div>
            {/if}
        </TabContent>
    </TabbedPane>
{:else}
    <Callout type="error">
        <span slot="header">More than one health checks node found!</span>
        In sum, {node.countInstances} instances of health checks nodes are found within all flows and subflows.<br>Please reduce the number of health checks nodes to exactly one!
    </Callout>
{/if}



