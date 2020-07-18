'use strict';

import React, {Component} from "react";
import ReactDOM from 'react-dom';
import MxGraphModule from 'mxgraph';

let MxGraph = MxGraphModule();
let mxConstants = MxGraph.mxConstants;

for (const [key, value] of Object.entries(MxGraph)) {
    if (!window[key])
        window[key] = value;
}

export class Graph extends Component {
    constructor(props) {
        super(props);

        /*
            [Required]props.model = json object
            [Optional] props.layout = serializedLayout
            [Optional] props.onVerticesSelected = function(selected) {}      
        */

        this.state = new Object();
        this.state.layout = props.layout;
    }

    SetStyles(graph) {
        // default vertex style
        let  defaultStyle = new Object();
        defaultStyle[MxGraph.mxConstants.STYLE_ROUNDED] = true;
        defaultStyle[MxGraph.mxConstants.STYLE_EDGE] = MxGraph.mxEdgeStyle.EntityRelation;
        defaultStyle[mxConstants.STYLE_PERIMETER] = MxGraph.mxPerimeter.RectanglePerimeter;
        defaultStyle[mxConstants.STYLE_GRADIENTCOLOR] = '#41B9F5';
        defaultStyle[mxConstants.STYLE_FILLCOLOR] = '#8CCDF5';
        defaultStyle[mxConstants.STYLE_STROKECOLOR] = '#1B78C8';
        defaultStyle[mxConstants.STYLE_FONTCOLOR] = '#000000';
        defaultStyle[mxConstants.STYLE_OPACITY] = '80';
        defaultStyle[mxConstants.STYLE_FONTSIZE] = '12';
        defaultStyle[mxConstants.STYLE_FONTSTYLE] = 0;
        graph.getStylesheet().putDefaultVertexStyle(defaultStyle);

        // port style
        let portStyle = new Object();
        portStyle[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_LABEL;
        portStyle[mxConstants.STYLE_FONTCOLOR] = '#774400';
        portStyle[mxConstants.STYLE_PERIMETER] = MxGraph.mxPerimeter.RectanglePerimeter;
        portStyle[mxConstants.STYLE_PERIMETER_SPACING] = '6';
        portStyle[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;
        portStyle[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
        portStyle[mxConstants.STYLE_FONTSIZE] = '10';
        portStyle[mxConstants.STYLE_FONTSTYLE] = 2;
        portStyle[mxConstants.STYLE_FILLCOLOR] = '#f57d41';
        portStyle[mxConstants.STYLE_GRADIENTCOLOR] = '#f57d41';
        portStyle[mxConstants.STYLE_FONTCOLOR] = '#0000FF';
        graph.getStylesheet().putCellStyle('port', portStyle);

        // quality style
        let qualityStyle = new Object();
        qualityStyle[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_LABEL;
        qualityStyle[mxConstants.STYLE_PERIMETER] = MxGraph.mxPerimeter.RectanglePerimeter;
        qualityStyle[mxConstants.STYLE_PERIMETER_SPACING] = '2';
        qualityStyle[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;
        qualityStyle[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
        qualityStyle[mxConstants.STYLE_FONTSIZE] = '10';
        qualityStyle[mxConstants.STYLE_FONTSTYLE] = 2;
        qualityStyle[mxConstants.STYLE_FILLCOLOR] = '#f5d741';
        qualityStyle[mxConstants.STYLE_GRADIENTCOLOR] = '#f5d741';        
        qualityStyle[mxConstants.STYLE_FONTCOLOR] = '#b941f5';
        graph.getStylesheet().putCellStyle('quality', qualityStyle);

        // name pseudo-vertex of each component
        let nameStyle = new Object();
        nameStyle[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_LABEL;
        nameStyle[mxConstants.STYLE_PERIMETER] = null;
        nameStyle[mxConstants.STYLE_PERIMETER_SPACING] = '2';
        nameStyle[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_MIDDLE;
        nameStyle[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
        nameStyle[mxConstants.STYLE_FONTSIZE] = '14';
        nameStyle[mxConstants.STYLE_FONTSTYLE] = 0;
        nameStyle[mxConstants.STYLE_FILLCOLOR] = '#00000000';
        nameStyle[mxConstants.STYLE_GRADIENTCOLOR] = '#00000000'; 
        nameStyle[mxConstants.STYLE_OPACITY] = '0';       
        nameStyle[mxConstants.STYLE_FONTCOLOR] = '#000000';
        nameStyle[mxConstants.STYLE_MOVABLE] = true;
        graph.getStylesheet().putCellStyle('name', nameStyle);

        // edges
        MxGraph.mxEdgeStyle.VerticalEntityRelation = this.VerticalEntityRelation;
        MxGraph.mxStyleRegistry.putValue("VerticalEntityRelation", MxGraph.mxEdgeStyle.VerticalEntityRelation);

        let edgeStyle = graph.getStylesheet().getDefaultEdgeStyle();
        edgeStyle[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = '#FFFFFF';
        edgeStyle[mxConstants.STYLE_STROKEWIDTH] = '2';
        edgeStyle[mxConstants.STYLE_ROUNDED] = true;
        // checked the source code, EntityRelation works only left to right
        edgeStyle[mxConstants.STYLE_EDGE] = MxGraph.mxEdgeStyle.EntityRelation;    
        edgeStyle[mxConstants.STYLE_SEGMENT] = 20;
    }

    // copied code over from EntityRelation (MxGraph source code) and reworked it to do bottom -> up edges
    VerticalEntityRelation(state, source, target, points, result) {
		var view = state.view;
	 	var graph = view.graph;
	 	var segment = mxUtils.getValue(state.style,
	 			mxConstants.STYLE_SEGMENT,
	 			mxConstants.ENTITY_SEGMENT) * view.scale;
	 	
		var pts = state.absolutePoints;
		var p0 = pts[0];
		var pe = pts[pts.length-1];
	 
        target = new mxCellState();
        target.x = pe.x;
        target.y = pe.y;
        
		if (source != null)
		{            
            var x0 = view.getRoutingCenterX(source);
            var y0 = source.y;
            
            var xe = view.getRoutingCenterX(target);
            var ye = target.y;
	
			var dep = new mxPoint(x0, y0 - segment);					
            var arr = new mxPoint(xe, ye + segment);
            
			if (dep.x > arr.x)
			{
                var midX = x0 + (xe - x0) / 2;
	
				result.push(dep);
				result.push(new mxPoint(midX, dep.y));
				result.push(new mxPoint(midX, arr.y));
				result.push(arr);
			}
			else
			{
				result.push(dep);
				result.push(arr);
			}
		}
	}

    AddSystemLabel(graph, model) {
        graph.insertVertex(graph.getDefaultParent(), null, model.Name, 0.5, 0.5, 100, 30, null, false);
    }

    AddPorts(graph, parent, ports, qualitiesCount) {
        var i;
        
        var port_count = ports.Inputs.length;
        for(i = 0; i < port_count; i++) {
            const offset = (i + 1) / (port_count + 1);
            var port = graph.insertVertex(parent, null, this.SerializeName(ports.Inputs[i].Name), 0, offset, 2, 2, 'port;spacingRight=5;align=center', true);
            port.geometry.offset = new MxGraph.mxPoint(-1, -1);            
        }

        var port_count = ports.Outputs.length;
        for(i = 0; i < port_count; i++) {
            const offset = (i + 1) / (port_count + 1);
            var port = graph.insertVertex(parent, null, this.SerializeName(ports.Outputs[i].Name), 1, offset, 2, 2, 'port;spacingLeft=5;align=center', true);
            port.geometry.offset = new MxGraph.mxPoint(-1, -1);
        }

        var port_count = ports.Supports.length;
        for(i = 0; i < port_count; i++) {
            const offset = (qualitiesCount + i + 1) / (port_count + qualitiesCount + 1);
            var port = graph.insertVertex(parent, null, this.SerializeName(ports.Supports[i].Name), offset, 0, 2, 2, 'port;align=center;rotation=90', true);
            port.geometry.offset = new MxGraph.mxPoint(-1, -1);
        }

        var port_count = ports.Requires.length;
        for(i = 0; i < port_count; i++) {
            const offset = (i + 1) / (port_count + 1);
            var port = graph.insertVertex(parent, null, this.SerializeName(ports.Requires[i].Name), offset, 1, 2, 2, 'port;align=center;rotation=90', true); 
            port.geometry.offset = new MxGraph.mxPoint(-1, -1);
        }
    }

    AddQualities(graph, componentVertex, qualities, supportsPortsCount) {
        if (qualities == null)
            return;

        const qualityNames = Object.keys(qualities);
        const qualityCount = qualityNames.length;
       
        for(let i = 0; i < qualityCount; i++) {
            const offset = (i + 1) / (qualityCount + supportsPortsCount + 1);
            var quality = graph.insertVertex(componentVertex, null, qualityNames[i], offset, 0, 2, 2, 'quality;spacingRight=5;align=center;rotation=90', true);
            quality.geometry.offset = new MxGraph.mxPoint(-1, -1);
        }
    }

    SerializeName(structuredName) {
        if (structuredName.index == undefined)
            return structuredName.name;

        return `${structuredName.name}[${structuredName.index}]`
    }

    GetArrayLengthSafe(array) {
        if (array.length == undefined)
            return 0;

        return array.length;
    }

    AddComponent(graph, parent, componentModel) {
        const NameStructure = componentModel.Name;
        const name = this.SerializeName(NameStructure);
        
        var component = graph.insertVertex(parent, null, null);
        component.connectable = false;
        var componentName = graph.insertVertex(component, null, name, 0, 0, null, null, 'name', false);   
        componentName.connectable = false;
        component.name = name;
        component.raw = componentModel;

        const qualityCount = this.GetArrayLengthSafe(Object.keys(componentModel.Qualities));
        const supportsPortsCount = this.GetArrayLengthSafe(componentModel.Ports.Supports);

        this.AddQualities(graph, component, componentModel.Qualities, supportsPortsCount);
        this.AddPorts(graph, component, componentModel.Ports, qualityCount);
        this.AddSubcomponents(graph, component, componentModel.Subcomponents);
        this.AddLinks(graph, component, componentModel);
    }

    AddSubcomponents(graph, parent, subcomponents) {
        if (subcomponents == null)
            return;

        subcomponents.forEach(subcomponent => {
            this.AddComponent(graph, parent, subcomponent);
        });
    }

    FindByStructuredName(cells, structuredName) {
        if (cells == null)
            return;

        let result = null;
        const soughtName = this.SerializeName(structuredName);
        
        cells.forEach(cell => {
            if (cell.isEdge())
                return;

            let name;
            if (cell.name != null)
                name = cell.name;
            else 
                name = cell.value;
            if (name == soughtName)
                result = cell;
        });
        return result;
    }

    AddLinks(graph, parent, model) {
        const children = parent.children;

	    if (model.OutputsToLinks) {
            model.OutputsToLinks.forEach(link => {
                var from = this.FindByStructuredName(children, link.From.componentName) || parent;
                var fromPort = this.FindByStructuredName(from.children, link.From.portName);

                var to = this.FindByStructuredName(children, link.To.componentName) || parent;
                var toPort = this.FindByStructuredName(to.children, link.To.portName);

                graph.insertEdge(parent, null, null, fromPort, toPort, "exitX=1;exitY=0.5;entryX=0;entryY=0.5");
            });
        }

        if (model.RunsOnLinks)
        {
            model.RunsOnLinks.forEach(link => {
                var from = this.FindByStructuredName(children, link.Guest.componentName) || parent;    
                var fromPort = this.FindByStructuredName(from.children, link.Guest.portName);

                var to = this.FindByStructuredName(children, link.Host.componentName) || parent;
                var toPort = this.FindByStructuredName(to.children, link.Host.portName);

                graph.insertEdge(parent, null, null, fromPort, toPort, "edgeStyle=VerticalEntityRelation;exitX=0;exitY=0.5;entryX=1;entryY=0.5");
            });
        }
    }

    CenterGraph(container, graph) {
        const bounds = graph.getGraphBounds();
        const tx = -bounds.x - (bounds.width - container.clientWidth) / 2;
        const ty = -bounds.y - (bounds.height - container.clientHeight) / 2;
        graph.view.setTranslate(tx, ty);

        // graph.getBounds(array of nodes)
    }

    ResizeAllCells(graph, vertices) {
        if (vertices == null)
            return;

                    
        vertices.forEach(vertex => {
            if (vertex.isEdge())
                return;
            
            let isPort = function(vertex) {
                if (vertex.style)
                    return vertex.style.startsWith("port") || vertex.style.startsWith("quality") || vertex.style.startsWith("name");
                else
                    return false;
            }

            let resizePort = function(graph, port) {
                const geometry = vertex.getGeometry();
                geometry.width += 5;
                geometry.height += 2;
            }

            let resizeNonPort = function(graph, vertex) {
                const geometry = vertex.getGeometry();
                geometry.width += 50;
                geometry.height += 100;
            }

            this.ResizeAllCells(graph, vertex.children);            

            graph.updateCellSize(vertex, false);  
            
            if (isPort(vertex))
                resizePort(graph, vertex);
            else {
                resizeNonPort(graph, vertex);  
            }
        });
    }

    CenterNames(vertices, graph) {
        if (vertices == null)
            return;

        vertices.forEach(vertex => {
            if (vertex.isEdge())
                return;

            let isName = function(vertex) {
                return vertex.style && vertex.style.startsWith("name");
            }
            
            if (isName(vertex)) {
                let parent = vertex.parent;

                const parentGeometry = parent.getGeometry();
                const geometry = vertex.getGeometry();
                const targetX = (parentGeometry.x + parentGeometry.width) / 2 - geometry.width / 2;
                const targetY = (parentGeometry.y + parentGeometry.height) / 2 - geometry.height / 2;

                console.log("Centering")
                graph.moveCells([vertex], targetX, targetY);
            }

            this.CenterNames(vertex.children, graph);
        })
    }

    CreateEmptyGraph(container) {       

        MxGraph.mxGraphHandler.prototype.guidesEnabled = true;
        MxGraph.mxEdgeHandler.prototype.snapToTerminals = true;
        MxGraph.mxGraphHandler.prototype.removeCellsFromParent = false;

        let graph = new MxGraph.mxGraph(container);

        // Makes it so that content of vertices cannot be modified
        graph.setCellsEditable(false);
        // Makes it so that new edges cannot be created
        graph.setConnectable(false);
        graph.setCellsBendable(false);
        // Makes it so that edges cannot point to nowhere
        graph.setAllowDanglingEdges(false);
        // THESE TWO DO NOT WORK (at least not yet)
        // Makes it so that multiple nodes can be selected at the same time
        graph.getSelectionModel().setSingleSelection(false);
        // Enables rubberband selection
        new MxGraph.mxRubberband(graph);
        this.SetStyles(graph);        

        return graph;
    }

    CreateLayout(graph) {
        let layout = new MxGraph.mxHierarchicalLayout(graph);
        layout.resizeParent = true;
        layout.moveParent = true;
        layout.parentBorder = 10;
        layout.disableEdgeStyle = false;
        layout.interRankCellSpacing = 200;
        layout.intraCellSpacing = 1;    
        return layout;
    }

    LoadGraphFromModel(graph, model) {
        model.Components.forEach(comp => {
            this.AddComponent(graph, graph.getDefaultParent(), comp);
        })

        this.AddLinks(graph, graph.getDefaultParent(), model);  
    }    

    LoadRandomGraph(graph, vertexCount, edgeCount) {
        const parent = graph.getDefaultParent();

        let vertices = [];

        for(var i = 0; i < vertexCount; i++) {
            let vertex = graph.insertVertex(parent, null, 'Vertex' + i);
            vertices.push(vertex);
        }

        for(var i = 0; i < edgeCount; i++) {
            const randomIndex = function() {
                return Math.floor(Math.random() * vertexCount);
            }

            const from = randomIndex();
            const to = randomIndex();

            graph.insertEdge(parent, null, null, vertices[from], vertices[to]);
        }
    }

    LoadGraphFromSave(container, graph) {
        const layout = this.state.layout;
        
        const doc = MxGraph.mxUtils.parseXml(layout);
        const codec = new MxGraph.mxCodec(doc);

        codec.decode(doc.documentElement, graph.getModel());   
        this.CenterGraph(container, graph);     
    }

    CreateGraph(container, graph) {
        graph.getModel().beginUpdate();

        try {            
            this.LoadGraphFromModel(graph, this.props.model);

            // this.LoadRandomGraph(graph, 100, 200);

        } finally {
            graph.getModel().endUpdate();
        }

        const vertices = graph.getModel().getChildren(graph.getDefaultParent());
        this.ResizeAllCells(graph, vertices);

        let layout = new MxGraph.mxHierarchicalLayout(graph);
        layout.resizeParent = true;
        layout.moveParent = true;
        layout.parentBorder = 5;
        layout.disableEdgeStyle = false;
        layout.interRankCellSpacing = 20;
        layout.intraCellSpacing = 10;
        layout.execute(graph.getDefaultParent());        
        
        this.CenterGraph(container, graph);
        this.CenterNames(vertices, graph);
    }

    LoadGraph() {
        let container = ReactDOM.findDOMNode(this.refs.divGraph);
        container.innerHTML = ""; // clear previous content
        const graph = this.CreateEmptyGraph(container);        
        this.graph = graph;

        // the layout includes all the elements of the graph, so there is no need to build it afterwards
        if (this.state.layout) 
            this.LoadGraphFromSave(container, graph);
        else
            this.CreateGraph(container, graph);   

        let selectionModel = graph.getSelectionModel()
        let self = this
        selectionModel.addListener(MxGraph.mxEvent.CHANGE, function(sender, event) {
            if (!this.selected) // persistently stored in this function
                this.selected = [];

            let selected = this.selected;

            // THIS IS NOT A BUG! (in our code at least). 
            // For historic reasons MxGraph's selectionModel has these two inverted
            // https://jgraph.github.io/mxgraph/docs/js-api/files/view/mxGraphSelectionModel-js.html#mxGraphSelectionModel.mxEvent.CHANGE
            
            let removed = event.getProperty('added')
            let added = event.getProperty('removed')

            if (removed) {
                removed.forEach(toRemove => {
                    let index = selected.indexOf(toRemove);
                    if (index >= 0)
                        selected.splice(index, 1);
                })
            }            

            if (added) {
                added.forEach(toAdd => {
                    selected.push(toAdd);
                })
            }
			
	//	let highlight = new MxGraph.mxCellHighlight(graph, "#000000", 5, false);
	//	highlight.highlight(graph.view.getState(selected[0]));

            if (self.props.onVerticesSelected) {
                self.props.onVerticesSelected(selected)
            }
        })
    }

    componentDidMount() {
        this.LoadGraph();
    }

    componentDidUpdate() {	
        this.LoadGraph();
    }

    serializeLayout() {
        const codec = new MxGraph.mxCodec(MxGraph.mxUtils.createXmlDocument());
        const node = codec.encode(this.graph.getModel());
        const layout = MxGraph.mxUtils.getXml(node);

        return layout;
    }

    loadLayout(layout) {
        this.setState({
            layout: layout
        });
    }

    resetLayout() {
        this.setState({
            layout: null
        })
    }
    
    render() {  
        return <div className="graph-container" ref="divGraph" id="divGraph" />;
    }
} 


