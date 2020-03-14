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
        var style = new Object();
        style[MxGraph.mxConstants.STYLE_ROUNDED] = true;
        style[MxGraph.mxConstants.STYLE_EDGE] = MxGraph.mxEdgeStyle.EntityRelation;
        style[mxConstants.STYLE_PERIMETER] = MxGraph.mxPerimeter.RectanglePerimeter;
        style[mxConstants.STYLE_GRADIENTCOLOR] = '#41B9F5';
        style[mxConstants.STYLE_FILLCOLOR] = '#8CCDF5';
        style[mxConstants.STYLE_STROKECOLOR] = '#1B78C8';
        style[mxConstants.STYLE_FONTCOLOR] = '#000000';
        style[mxConstants.STYLE_OPACITY] = '80';
        style[mxConstants.STYLE_FONTSIZE] = '12';
        style[mxConstants.STYLE_FONTSTYLE] = 0;
        graph.getStylesheet().putDefaultVertexStyle(style);

        style = new Object();
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_LABEL;
        style[mxConstants.STYLE_FONTCOLOR] = '#774400';
        style[mxConstants.STYLE_PERIMETER] = MxGraph.mxPerimeter.RectanglePerimeter;
        style[mxConstants.STYLE_PERIMETER_SPACING] = '6';
        style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;
        style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
        style[mxConstants.STYLE_FONTSIZE] = '10';
        style[mxConstants.STYLE_FONTSTYLE] = 2;
        graph.getStylesheet().putCellStyle('port', style);

        var style = graph.getStylesheet().getDefaultEdgeStyle();
        style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = '#FFFFFF';
        style[mxConstants.STYLE_STROKEWIDTH] = '2';
        style[mxConstants.STYLE_ROUNDED] = true;
        style[mxConstants.STYLE_EDGE] = MxGraph.mxEdgeStyle.EntityRelation;
    }

    AddSystemLabel(graph, model) {
        graph.insertVertex(graph.getDefaultParent(), null, model.Name, 0.5, 0.5, 100, 30, null, false);
    }

    AddPorts(graph, parent, ports) {
        var i;
        
        var port_count = ports.Inputs.length;
        for(i = 0; i < port_count; i++) {
            const offset = (i + 1) / (port_count + 1);
            var port = graph.insertVertex(parent, null, ports.Inputs[i].Name, 0, offset, 2, 2, 'port;spacingRight=5;align=center', true);
            port.geometry.offset = new MxGraph.mxPoint(-1, -1);            
        }

        var port_count = ports.Outputs.length;
        for(i = 0; i < port_count; i++) {
            const offset = (i + 1) / (port_count + 1);
            var port = graph.insertVertex(parent, null, ports.Outputs[i].Name, 1, offset, 2, 2, 'port;spacingLeft=5;align=center', true);
            port.geometry.offset = new MxGraph.mxPoint(-1, -1);
        }

        var port_count = ports.Supports.length;
        for(i = 0; i < port_count; i++) {
            const offset = (i + 1) / (port_count + 1);
            var port = graph.insertVertex(parent, null, ports.Supports[i].Name, offset, 0, 2, 2, 'port;spacingRight=5;align=center;rotation=90', true);
            port.geometry.offset = new MxGraph.mxPoint(-1, -1);
        }

        var port_count = ports.Requires.length;
        for(i = 0; i < port_count; i++) {
            const offset = (i + 1) / (port_count + 1);
            var port = graph.insertVertex(parent, null, ports.Requires[i].Name, offset, 1, 2, 2, 'port;spacingRight=5;align=center;rotation=90', true);
            port.geometry.offset = new MxGraph.mxPoint(-1, -1);
        }
    }

    AddComponent(graph, parent, componentModel) {
        const NameStructure = componentModel.Name;
        const name = NameStructure.name;
        
        var component = graph.insertVertex(parent, null, name);   

        this.AddPorts(graph, component, componentModel.Ports);
        this.AddLinks(graph, component, componentModel);
    }

    FindByValue(cells, value) {
        let result;
        cells.forEach(cell => {
            if (cell.value == value)
                result = cell;
        });
        return result;
    }

    AddLinks(graph, parent, model) {
        const children = parent.children;

	if (model.OutputsToLinks)
		model.OutputsToLinks.forEach(link => {
		    var from = this.FindByValue(children, link.From.componentName);
		    var fromPort = this.FindByValue(from.children, link.From.portName);

		    var to = this.FindByValue(children, link.To.componentName);
		    var toPort = this.FindByValue(to.children, link.To.portName);

		    graph.insertEdge(parent, null, null, fromPort, toPort);
		});

	if (model.RunsOnLinks)
		model.RunsOnLinks.forEach(link => {
		    var from = this.FindByValue(children, link.From.componentName);
		    var fromPort = this.FindByValue(from.children, link.From.portName);

		    var to = this.FindByValue(children, link.To.componentName);
		    var toPort = this.FindByValue(to.children, link.To.portName);

		    graph.insertEdge(parent, null, null, fromPort, toPort);
		});
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
                    return vertex.style.startsWith("port");
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
            else
                resizeNonPort(graph, vertex);       
        });
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
        layout.parentBorder = 50;
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
            this.LoadGraphFromModel(graph, this.model);

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
    }

    LoadGraph() {
        let container = ReactDOM.findDOMNode(this.refs.divGraph);
        container.innerHTML = ""; // clear previous content
        const graph = this.CreateEmptyGraph(container);        
        this.graph = graph;

        if (this.state.layout) 
            this.LoadGraphFromSave(container, graph);
        else
            this.CreateGraph(container, graph);   

        let selectionModel = graph.getSelectionModel()
        let self = this
        selectionModel.addListener(MxGraph.mxEvent.CHANGE, function(sender, event) {
            // THIS IS NOT A BUG! (in our code at least). 
            // For historic reasons MxGraph's selectionModel has these two inverted
            // https://jgraph.github.io/mxgraph/docs/js-api/files/view/mxGraphSelectionModel-js.html#mxGraphSelectionModel.mxEvent.CHANGE
            let removed = event.getProperty('added')
            let added = event.getProperty('removed')

            if (self.props.onVerticesSelected) {
                self.props.onVerticesSelected(added)
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


