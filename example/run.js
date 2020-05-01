import React from 'react';
import ReactDOM from "react-dom";
import { Graph } from "../src/index.js";

let model = {
    Name: "System",
    Components: [
        {
            Type: "Source",
            Configuration: "default",
            Name: {
                "Name" : "mySource"
                // no index
            },	
            Qualities: {
                "memory_consumption": "1024"
            },
            Ports: {
                Inputs: [],
                Outputs: [
                {
                    Type: "defaultChannel",
                    Name: {
                        "Name": "myOutput"
                    }
                }],
                Supports: [
                {
                    Type: "defaultBudget",
                    Name: {
                        "Name": "mySupports"
                    }
                }],
                Requires: []
            },
            
            // Only used in case of aggregate component
            Subcomponents: [],
            // Only used for links within the aggregate component
            RunsOnLinks: [],
            OutputsToLinks: [],			
        },
        {
            Type: "Sink",
            Configuration: "default",
            Name: {
                "Name": "mySink"
            },
            Qualities: {
                "memory_consumption": "2048"
            },
            Ports: {
                Inputs: [{
                    Type: "defaultChannel",
                    Name: {
                        "Name": "myInput"
                    }
                }],
                Outputs: [],
                Supports: [
                {
                    Type: "defaultBudget",
                    Name: {
                        "Name": "mySupports"
                    }
                }],
                Requires: []
            },
            Subcomponents: [],
            RunsOnLinks: [],
            OutputsToLinks: [],	
        }
    ],
    RunsOnLinks: [		
    ],
    OutputsToLinks: [
        {
            From: {
                componentName:  {
                    "Name": "mySource"
                },
                portName: {
                    "Name": "myOutput"
                }
            },
            To: {
                componentName: {
                    "Name": "mySink"
                },
                portName: {
                    "Name": "myInput"
                }
            },
            Qualities: {
                bandwidth: "100",
                isWorking: "true"
            }
        }
    ],
    Qualities: {
        SourceCount: "1",
        SinkCount: "1"		
    }
}

let container = document.getElementById('root');
ReactDOM.render(<Graph model={model} />, container);
//ReactDOM.render(<h1>Hello, world</h1>, container);