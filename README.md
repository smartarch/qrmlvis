# Introduction
The QRMLVis library is a react javascript library containing a react component used for visualizing architectures of systems described y the QRML language. (TODO: link to QRML github page?)

As of right now this repository does not generate any NPM package, and is intended to be used as git submodule (may change in the future).

# The example
To run the example, first build the code using:
```
npm run build
```
The library has been tested with npm version 6.14.6.

Afterwards you can open the *example/index.html* file (using file:// protocol, no need for custom http server).

The example contains a simple system definition (as can be seen in the file *example/run.js*), which is then visualized by the visualization component.

# API
The Graph component contains three public functions, all aimed at managing layout:

```
serializeLayout() - returns a string representing the serialized visualization graph

loadLayout([String]layout) - accepts a string representing the serialized visualization graph and loads the visualization from it

resetLayout() - resets the visualization layout to the default configuration
```

# Parameters
The Graph react component accepts the following paramters:

**[Required]** model - Javascript object as will be described in the following section

[Optional] layout - serialized layout from previous usages of the library.

[Optional] onVerticesSelected - callback function called whenever selection of vertices in the graph changes. This function receives an array of MxCell objects.

## Input object specification
This section describes the object format of the **model** input parameter.

Root - system: 
```
{
	<string> Name - Name of the system,
	<Component[]> Components - Array of the top-level components of the system (i.e. sub-components of composite components are not listed here),
    <Link[]> RunsOnLinks - List of vertical (budget, environment) bindings between top-level components (i.e. those listed in the Components list),
	<Link[]> OutputsToLinks - List of horizontal (data, channel) bindings between top-level components
	<Dictionary> Qualities - A list of all qualities of the system
}
```
Component:
```
{
	<string> Type - Name of the component type
	<Name> Name - Name of the component instance
	<string> Configuration - Name of the used component configuration
	<Dictionary> Qualities - A list of all qualities of the component
	<Ports> Ports - An object containing the specification of the component's ports
	<Component[]> Subcomponents - A list of subcomponents of this component, used when the component is a composite,
	<Link[]> RunsOnLinks - A list of vertical bindings of subcomponents,
	<Link[]> OutputsToLinks - A list of horizontal bindings of subcomponents
}
```

Ports:
```
{
	<Port[]> Inputs - A list of all data input ports
	<Port[]> Outputs - A list of all data output ports
	<Port[]> Requires - A list of all budget input ports
	<Port[]> Supports - A list of all budget output ports
}
```

Port:
```
{
	<string> Type - Name of the interface type of the port
	<Name> Name - Name of the port
}
```

Link:
```
{
	<LinkEndpoint> From - Source of the binding (usually outputs or supports port),
	<LinkEndpoint> To - Target of the binding (usually inputs or requires port),
	<Dictionary> Qualities - A list of qualities of the binding
}
```

LinkEndpoint:
```
{
	<Name> ComponentName - Structured name of the component. Omitted when connecting a port of a composite component to a subcomponent (e.g. input port of composite component to input port of subcomponent -- in that case the component name of the parent component is omitted)
	<Name> PortName - Structured name of the port
}
```

Name:
```
{
	<string> Name - Base name
	<int> index - If the name is part of an array, here is the index of the array, otherwise undefined
}
```

# Used technologies
The library is build using the MxGraph library ([API documentation](https://jgraph.github.io/mxgraph/docs/js-api/files/index-txt.html)). 
