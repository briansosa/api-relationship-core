import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout } from 'antd';
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import FlowSidebar from '../../components/common/FlowSidebar';
import TemplateNode from '../../components/flow/TemplateNode';
import InputNode from '../../components/flow/InputNode';
import { useParams } from 'react-router-dom';
import ShortUniqueId from "short-unique-id";
import { useNavigate } from 'react-router-dom';
import FlowToolbar from '../../components/flow/FlowToolbar';

import { GetAllSchemasWithTemplates } from '../../../wailsjs/go/handlers/OperationSchemaHandler';
import { GetAllFlows, InsertFlow, GetFlow, DeleteFlow, UpdateFlow } from '../../../wailsjs/go/handlers/FlowHandler';
import { flow } from '../../../wailsjs/go/models';
// Definimos nodeTypes fuera del componente
const NODE_TYPES = {
  template: TemplateNode,
  input: InputNode
};

const FlowView = () => {  
  const urlParams = useParams();
  const navigate = useNavigate();
  
  // Memoizamos nodeTypes si necesitamos acceder a props o estado
  const nodeTypes = useMemo(() => NODE_TYPES, []);

  const entityInit = {
    id: "0",
    name: "",
    template_id: "",
    max_concurrency: 1,
    search_type: "simple",
    relation_fields: [],
    relation_operations: []
  };


  // Hooks
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const [schemas, setSchemas] = useState([]);
  const [state, setState] = useState({
    entity: entityInit,
    id: urlParams.id ? urlParams.id : "0",
    flows: [],
    disable: true
  });


  useEffect(() => {
    console.log("urlParams changed:", urlParams);
    
    if (!urlParams.id && !urlParams.mode) {
      console.log("no id or mode, getting all flows");
      GetAllOperationsFlow();
    }

    if (urlParams.id !== "0" && urlParams.mode === "edit") {
      console.log("id and mode, getting flow:", urlParams.id);
      setState((prevState) => ({
        ...prevState,
        id: urlParams.id,
        mode: urlParams.mode,
        disable: false,
      }));

      GetOperationFlow(urlParams.id);
    }
  }, [urlParams]);

  const handleTemplateSelect = (templateId) => {
    // templateId viene como un array con un único elemento
    const selectedTemplateId = Array.isArray(templateId) ? templateId[0] : templateId;
    
    // Buscamos el schema y template correspondiente
    let selectedTemplate = null;
    let selectedSchema = null;

    // Iteramos sobre los schemas para encontrar el template
    schemas.forEach(schema => {
      const template = schema.list_templates?.find(t => t.id === selectedTemplateId);
      if (template) {
        selectedTemplate = template;
        selectedSchema = schema;
      }
    });

    if (!selectedTemplate) {
      console.error('Template not found:', selectedTemplateId);
      return;
    }

    const uid = new ShortUniqueId();
    const nodeId = `template-${uid.rnd()}`;

    const newNode = {
      id: nodeId,
      type: 'template',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { 
        template: selectedTemplate,
        responseSchema: selectedSchema?.schema || [],
        onConnect
      },
      draggable: true,
      style: {
        width: 400,
        minWidth: 300,
        maxWidth: 800
      }
    };
    
    setNodes(prev => [...prev, newNode]);
  };

  // Handlers

  // Manejador para actualizar nodos que pasaremos al TemplateNode
  const handleNodeChange = useCallback((changes) => {
    setNodes((nds) => {
      return nds.map(node => {
        const change = changes.find(c => c.id === node.id);
        if (change) {
          return { ...node, ...change };
        }
        return node;
      });
    });
  }, [setNodes]);


  // Manejador para eliminar nodos
  const handleNodesDelete = useCallback((nodesToDelete) => {
    setNodes(nodes => nodes.filter(node => 
      !nodesToDelete.find(n => n.id === node.id)
    ));
  }, [setNodes]);

  const handleAddFlow = () => {
    console.log("add flow");
    const randomId = new ShortUniqueId().rnd();
    const entity = {
      id: randomId,
      name: "New Flow",
      max_concurrency: 1,
      search_type: "",
      relation_fields: [],
      relation_operations: []
    }

    InsertOperationFlow(entity);
  }

  // Manejador de conexiones
  const onConnect = useCallback((params) => {
    // params contiene sourceHandle, targetHandle, source (nodeId), target (nodeId)
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);


  const handleFlowSelect = (flowId) => {
    setState(prevState => ({
      ...prevState,
      id: flowId,
      disable: false
    }));

    const url = `/flow/${flowId}/edit`;
    navigate(url);
  };

  const handleDeleteFlow = (flow) => {
    DeleteFlow(flow.id)
      .then(() => {
        // Actualizar la lista de flows
        GetAllOperationsFlow();
        // Si el flow eliminado es el seleccionado, limpiar la selección
        if (state.id === flow.id) {
          setState(prevState => ({
            ...prevState,
            id: "0",
            entity: entityInit,
            disable: true
          }));
          navigate('/flow');
        }
      })
      .catch((error) => {
        console.error('Error deleting flow:', error);
      });
  };

  const handleRenameFlow = (flowId, newName) => {    
    const flow = state.flows.find(t => t.id === flowId);
    const flowEntity = {
      ...flow,
      name: newName
    }
    
    UpdateFlow(flowEntity)
      .then(() => {
        // Actualizar la lista de flows
        GetAllOperationsFlow();
        // Si el flow renombrado es el seleccionado, actualizar el estado
        if (state.id === flowId) {
          setState(prevState => ({
            ...prevState,
            entity: {
              ...prevState.entity,
              name: newName
            }
          }));
        }
      })
      .catch((error) => {
        console.error('Error renaming flow:', error);
      });
      
  };

  // Functions

  function LoadSchemas() {
    setLoading(true);
    GetAllSchemasWithTemplates()
      .then((result) => {
        console.log("result schemas with templates", result);
        setSchemas(result);
      })
      .catch((error) => {
        console.error('Error loading schemas:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  function GetAllOperationsFlow() {
    GetAllFlows()
      .then((result) => {
        console.log("result flows", result);
        setState(prevState => ({
          ...prevState,
          flows: result
        }));
      })
      .catch((error) => {
        console.error('Error loading flows:', error);
      });
  }

  function InsertOperationFlow(flow) {
    InsertFlow(flow)
      .then((result) => {
        setState(prevState => ({
          ...prevState,
          entity: {
            ...prevState.entity,
            id: result.id
          }
        }));

        const url = `/flow/${result.id}/edit`;
        navigate(url);
      })
      .catch((error) => {
        console.error('Error inserting operation flow:', error);
      });
  }

  function GetOperationFlow(id) {
    GetFlow(id)
      .then((result) => {
        console.log("result get operation flow", result);

        LoadNodes(result);
        setState(prevState => ({
          ...prevState,
          entity: result,
          disable: false,
          empty: false
        }));

        LoadSchemas();
      })
      .catch((error) => {
        console.error('Error getting operation flow:', error);
      });
  }

  function LoadNodes(flow) {
    const nodes = [];

    // Agregamos el nodo de inputs si es necesario
    if (flow.relation_fields.length === 0) {
      nodes.push({
        id: 'inputs',
        type: 'input',
        position: { x: 100, y: 100 },
        data: {},
        draggable: true
      });
    }

    setNodes(nodes);
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <FlowSidebar
        loading={loading}
        schemas={schemas}
        onAddFlow={handleAddFlow}
        onTemplateSelect={handleTemplateSelect}
        onFlowSelect={handleFlowSelect}
        onDeleteFlow={handleDeleteFlow}
        onRenameFlow={handleRenameFlow}
        flows={state.flows}
      />
      <Layout>
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <FlowToolbar data={{ name: state.entity.name }} />
          <ReactFlow 
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodesDelete={handleNodesDelete}
            nodesDraggable={true}
            panOnDrag={true}
            defaultViewport={{ x: 100, y: 100, zoom: 0.4 }}
            minZoom={0.2}
            maxZoom={1.5}
            fitView
            fitViewOptions={{ padding: 50, minZoom: 0.8 }}
            deleteKeyCode={['Backspace', 'Delete']}
            zoomOnScroll={true}
            panOnScroll={false}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </Layout>
    </Layout>
  );
};

export default FlowView;
