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
                value: [ { name:"MQTT connected", id:"1", status:false }, { name:"DB tables created", id:"2", status:false } ]
//                value: []
            },
            started: {
                value: [ "2" ]
//                value: []
            },
            ready: {
                value: [ "1" ]
//                value: []
            },
            alive: {
                value: [ "1", "2" ]
//                value: []
            }
		},
		inputs: 0,
		outputs: 0,
		color: "#C7E9C0",
		icon: "hb.svg",
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
    import { Input, Button, TabbedPane, TabContent, EditableList, Row } from 'svelte-integration-red/components'

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

    function changeIdStatus(array, id, status) {
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
                          height=370
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
                <EditableList bind:elements={node.conditions} let:element={condition} let:index>
                    <div class:required={true} style="display:flex;">
                        <div style="min-width: 99px;">
                            <Input type="checkbox"
                                   label={' ' + condition.name}
                                   value={isIdContained(node.started, node.conditions[index].id)}
                                   on:change={(e) => (changeIdStatus(node.started, node.conditions[index].id, e.detail.value))}/>
                        </div>
                    </div>
                </EditableList>
            {:else}
                <div style="margin-top: 30px; font-weight: bold;">No Conditions found!</div>
            {/if}
        </TabContent>

        <TabContent tab="readiness">
            {#if node.conditions.length > 0}
                <EditableList bind:elements={node.conditions} let:element={condition} let:index>
                    <div class:required={true} style="display:flex;">
                        <div style="min-width: 99px;">
                            <Input type="checkbox"
                                   label={' ' + condition.name}
                                   value={isIdContained(node.ready, node.conditions[index].id)}
                                   on:change={(e) => (changeIdStatus(node.ready, node.conditions[index].id, e.detail.value))}/>
                        </div>
                    </div>
                </EditableList>
            {:else}
                <div style="margin-top: 30px; font-weight: bold;">No Conditions found!</div>
            {/if}
        </TabContent>

        <TabContent tab="liveness">
            {#if node.conditions.length > 0}
                <EditableList bind:elements={node.conditions} let:element={condition} let:index>
                    <div class:required={true} style="display:flex;">
                        <div style="min-width: 99px;">
                            <Input type="checkbox"
                                   label={' ' + condition.name}
                                   value={isIdContained(node.alive, node.conditions[index].id)}
                                   on:change={(e) => (changeIdStatus(node.alive, node.conditions[index].id, e.detail.value))}/>
                        </div>
                    </div>
                </EditableList>
            {:else}
                <div style="margin-top: 30px; font-weight: bold;">No Conditions found!</div>
            {/if}
        </TabContent>
    </TabbedPane>
{:else}
  <div>More than one <strong>health checks</strong> node found!</div>
{/if}



