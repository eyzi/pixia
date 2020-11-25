# Pixia
Axia Lwrp Wrapper Library

## Installation
`npm install --save pixia`

## Usage
```
const pixia = require("pixia");

pixia.on("source",src=>{
    console.log(src);
});

pixia.on("destination",dst=>{
    console.log(dst);
});

pixia.addDevice({
    name: 'XNode',
    host: '172.16.0.5',
    port: 93,
    pass: ''
});
```

# Structures

## Manager

### Properties
- devices `{[Device]}`, All added devices to manager
- sources `{[Source]}`, All sources of all devices for easy access

### Methods
- addDevice(DeviceData), Returns `{Device}`
- removeDevice(String), Removes Device host `String` from list of devices. Returns `{null}`

### Events
- data `{LwrpData}`, parsed LWRP data
- destination `{DestinationData}`, change in a device destination
- error `{ErrorData}`
- gpi `{GPI}`, change in GPI
- gpo `{GPO}`, change in GPO
- meter `{MeterData}`, change in meter
- running, The LWRP socket is connected and running the command poll
- source `{SourceData}`, change in a device source


## Device

### Properties
- destinations `{[Destination]}`, collection of device's destinations
- gpis `{[Gpi]}`, collection of device's GPIs
- gpos `{[Gpo]}`, collection of device's GPOs
- host `{String}`, IP of device
- lwrp `{Lwrp}`, socket connected to the device
- name `{String}`, device's friendly name
- pass `{String}`, pass used for login
- port `{String|Number}`, LWRP port. Defaults to `93`
- sources `{[Source]}`, collection of device's sources

### Method
- getDestinations(), Calls `DST` from LWRP. Returns `{null}`
- getGpis(), Calls `ADD GPI` from LWRP. Returns `{null}`
- getGpos(), Calls `ADD GPO` from LWRP. Returns `{null}`
- getMeters(), Adds `MTR` to LWRP poll. Returns `{null}`
- getSources(), Calls `SRC` from LWRP. Returns `{null}`
- getVersion(), Calls `VER` from LWRP. Returns `{null}`
- hasCommand(CommandString), Check if `CommandString` is in LWRP poll. Returns `{Boolean}`
- login(String), Logs into LWRP with `String` as password. Default is `this.pass`. Returns `{null}`
- stop(), stop device LWRP
- write(String), Writes `String` to LWRP. Returns `{Boolean}`

### Events
- data `{LwrpData}`, parsed LWRP data.
- destination `{Destination}`, change in destination
- error `{ErrorData}`
- gpi `{GPI}`, change in GPI
- gpo `{GPO}`, change in GPO
- meter `{MeterData}`, change in meter
- running, The LWRP socket is connected and running the command poll
- source `{Source}`, change in source



## Source

### Properties
- address `{String}`, IP/RTPA
- channel `{String}`
- chCount `{Number}`, number of audio channels
- device `{Device}`, parent device
- name `{String}`, friendly name
- raw `{LwrpData}`
- streamType `{String}`, `DST` or `SRC`
- subscribers `{[Destination]}`, destinations listening to this source

### Methods
- addSub(Destination)
- removeSub(Destination)
- update(LwrpData)

### Events
- change, on source update


## Destination

### Properties
- address `{String}`, IP/RTPA
- channel `{String}`
- chCount `{Number}`, number of audio channels
- device `{Device}`, parent device
- name `{String}`, friendly name
- raw `{LwrpData}`
- streamType `{String}`, `DST` or `SRC`
- source `{Source}`

### Methods
- setAddress(rtpa)

### Events
- change, on destination update
