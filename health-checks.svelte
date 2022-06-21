<script context="module">
  /* This is mostly identical to a standard Node-RED node. Important: It must be stated in script context="module"! */
  RED.nodes.registerType("health checks", {
		category: "Kubernetes",
		defaults: {
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
    // get your node variable from extern and import the needed components from SIR
    export let node
    import { Input, Button, TabbedPane, TabContent } from 'svelte-integration-red/components'
    // then add your javascript functions
    const myButtonFunc = () => alert('The button was pressed')

    let tabs = {
        "conditions": "Conditions",     // icon: fa fa-list
        "startup": "Startup-Probe",     // icon: fa fa-floppy-o
        "readiness": "Readiness-Probe", // icon: fa fa-check
        "liveness": "Liveness-Probe",   // icon: fa fa-heartbeat
    }
</script>

<!-- Now enter your svelte code -->
<!-- just bind node and set the property name which you have stated above in the defaults variable -->
<Input bind:node prop="name" />
<Input bind:node prop="port" />
<TabbedPane bind:tabs>
    <TabContent tab="conditions" iconClass="tag">
        <Button icon="plus" label="Click me" on:click={myButtonFunc}/>
    </TabContent>

    <TabContent tab="startup">

    </TabContent>

    <TabContent tab="readiness">

    </TabContent>

    <TabContent tab="liveness">

    </TabContent>
</TabbedPane>
