import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { InsertFieldsResponse, GetFieldsResponseByFlowID, UpdateFieldsResponse, DeleteFieldsResponse } from '../../../wailsjs/go/handlers/FieldsResponseHandler';
import { useTemplateFields } from '../../context/TemplateFieldsContext';
import { useFlowContext } from '../../context/FlowContext';


const FlowView = () => {
  
  // Constants
  const entityInit = {
    id: "0",
    name: "",
    template_id: "",
    max_concurrency: 1,
    search_type: "simple",
    relation_fields: [],
    relation_operations: [],
    fields_response_id: []
  };
  
  // Hooks
  const edgesRef = useRef([]);
  const urlParams = useParams();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fieldResponseSelected, setFieldResponseSelected } = useFlowContext();
  const [schemas, setSchemas] = useState([]);
  const [state, setState] = useState({
    entity: entityInit,
    id: urlParams.id ? urlParams.id : "0",
    flows: [],
    disable: true,
    fieldsResponses: []
  });

  const { 
    templateFields,
    updateTemplateFields, 
    toggleField, 
    isFieldSelected, 
    getFieldsResponse
  } = useTemplateFields();

  useEffect(() => {    
    if (!urlParams.id && !urlParams.mode) {
      console.log('ejecutando primera entrada');
      GetAllOperationsFlow();
    }

    if (urlParams.id !== "0" && urlParams.mode === "edit") {
      console.log('ejecutando segunda entrada');
      setState((prevState) => ({
        ...prevState,
        id: urlParams.id,
        mode: urlParams.mode,
        disable: false,
      }));

      GetOperationFlow(urlParams.id);
    }
  }, [urlParams]);

  useEffect(() => {
    if (nodes.length > 0 && edgesRef.current.length > 0) {
      console.log('renderizando nodos y edges');
      setEdges(edgesRef.current);
      edgesRef.current = [];
    }
  }, [nodes]);

  //
  // Handlers
  //


  // Templates

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
        template: {
          ...selectedTemplate,
          max_concurrency: selectedTemplate.max_concurrency || 1,
          search_type: selectedTemplate.search_type || 'simple'
        },
        responseSchema: selectedSchema?.schema || [],
        onConnectHandler
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


  // Flows

  const handleAddFlow = () => {
    const randomId = new ShortUniqueId().rnd();
    const entity = {
      id: randomId,
      name: "New Flow",
      max_concurrency: 1,
      search_type: "",
      relation_fields: [],
      relation_operations: [],
      fields_response_id: []
    }

    InsertOperationFlow(entity);
  };

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

    UpdateOperationFlow(flowEntity);
  };

  const handleSaveFlow = () => {
    // Encontrar el nodo input
    const inputNode = nodes.find(node => node.type === 'input');
    if (!inputNode) {
      console.error('No se encontró el nodo input');
      return;
    }

    // Encontrar el primer nodo template conectado al input
    const inputConnections = edges.filter(edge => edge.source === inputNode.id);
    if (inputConnections.length === 0) {
      console.error('El nodo input no tiene conexiones');
      return;
    }

    // Obtener el nodo template conectado
    const firstTemplateNode = nodes.find(node => node.id === inputConnections[0].target);
    if (!firstTemplateNode) {
      console.error('No se encontró el nodo template conectado');
      return;
    }
    
    // Procesar las conexiones del primer nodo template
    const relationOperations = processNodeConnections(firstTemplateNode.id, nodes, edges);

    // Construir relation_fields basado en las conexiones del input
    const relationFields = inputConnections.map(connection => {
      // En lugar de buscar por el sourceHandle, buscaremos la conexión correcta
      // basándonos en el campo actual que tiene esa posición en el nodo input
      const fieldIndex = inputNode.data.fields.findIndex((field, index) => 
        `input-field_${index + 1}` === connection.sourceHandle
      );

      // Si encontramos el campo, usamos su nombre actual
      const field = fieldIndex !== -1 ? inputNode.data.fields[fieldIndex] : null;
      const parentField = field ? field.name : connection.sourceHandle.replace('input-', '');
      
      const childParameter = connection.targetHandle.split('-').pop();

      return {
        type: "input",
        parent_field: parentField,
        child_parameter: childParameter
      };
    });    

    // Construir la entidad a guardar
    const flowEntity = {
      id: state.entity.id,
      operation_schema_id: firstTemplateNode.data.template.id,
      name: state.entity.name,
      max_concurrency: firstTemplateNode.data.template.max_concurrency || 1,
      search_type: firstTemplateNode.data.template.search_type || "",
      relation_fields: relationFields,
      relation_operations: relationOperations || [],
      fields_response_id: state.entity.fields_response_id,
      fields_response: getFieldsResponse(fieldResponseSelected)
    };

    console.log('Entidad a guardar:', flowEntity);
    console.log('Fields response guardar:', fieldResponseSelected);
    
    UpdateFieldsResponse(fieldResponseSelected).then(() => {
      UpdateOperationFlow(flowEntity);
    }).catch((error) => {
      console.error('Error updating fields response:', error);
    });
    
  };


  // Fields Response
  
  const handleAddFieldResponse = (data) => {
    const uid = new ShortUniqueId();
    const fieldsResponse = {
      id: uid.rnd(),
      name: data.name,
      flow_id: state.entity.id,
      fields_response: []
    }
    
    InsertOperationFieldsResponse(fieldsResponse);
  };
  
  const handleDeleteFieldResponse = (fieldResponseId) => {
    if (state.fieldsResponses.length == 1) {
      console.log('No se puede eliminar, es el único elemento en la lista.');
      return
    } 
    
    DeleteOperationFieldsResponse(fieldResponseId);
  };
  
  const handleRenameFieldResponse = (newName) => {
    const fieldResponseEntity = state.fieldResponseSelected;
    fieldResponseEntity.name = newName;
    
    UpdateFieldsResponse(fieldResponseEntity);
  };
  
  const handleFieldsResponseSelect = (fieldResponseId) => {
    const fieldResponseEntity = state.fieldsResponses.find(fr => fr.id === fieldResponseId);
    
    // Actualizar ambos estados de forma consistente
    setFieldResponseSelected(fieldResponseEntity);
    setState(prevState => ({
      ...prevState,
      fieldResponseSelected: fieldResponseEntity
    }));
  };

  // Actualizar cuando cambia fieldResponseSelected
  useEffect(() => {
    if (state.fieldResponseSelected) {
      updateTemplateFields(state.fieldResponseSelected);
    }
  }, [state.fieldResponseSelected, updateTemplateFields]);


  // Nodes and Edges

  const handleNodesDelete = useCallback((nodesToDelete) => {
    setNodes(nodes => nodes.filter(node => 
      !nodesToDelete.find(n => n.id === node.id)
    ));
  }, [setNodes]);
  
  const onConnectHandler = useCallback((params) => {
    // params contiene sourceHandle, targetHandle, source (nodeId), target (nodeId)
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);


  const handleInputNodeUpdate = useCallback((nodeId, newData) => {
    setNodes(nodes => 
      nodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      })
    );
  }, []);

  //
  // ApiCalls
  //

  // Flows
  
  function GetAllOperationsFlow() {
    GetAllFlows()
      .then((result) => {
        console.log('flows primera entrada', result);
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

        const uid = new ShortUniqueId();
        const fieldsResponse = {
          id: uid.rnd(),
          name: "New Fields Response",
          flow_id: result.id,
          fields_response: []
        }

        InsertOperationFieldsResponse(fieldsResponse).then(() => {

          // Inicializar el canvas con un nodo input
          const inputNode = {
            id: 'inputs',
            type: 'input',
            position: { x: 100, y: 100 },
            data: {
              fields: []
            },
            draggable: true
          };

          setNodes([inputNode]);
          setEdges([]);

          const url = `/flow/${result.id}/edit`;
          navigate(url);
        });
      })
      .catch((error) => {
        console.error('Error inserting operation flow:', error);
      });
  }

  async function GetOperationFlow(id) {
    try {
      const flowResult = await GetFlow(id);
      const schemasResult = await GetAllSchemasWithTemplates();
      setSchemas(schemasResult);
      LoadNodes(flowResult, schemasResult);
      GetAllOperationsFlow();
      const fieldsResponseResult = await GetFieldsResponseByFlowID(flowResult.id);
      
      // Inicializar templateFields y fieldResponseSelected
      if (fieldsResponseResult.length > 0) {
        const initialFieldResponse = fieldsResponseResult[0];
        
        // Actualizar el contexto
        setFieldResponseSelected(initialFieldResponse);
        
        // Actualizar el estado local
        setState(prevState => ({
          ...prevState,
          entity: flowResult,
          disable: false,
          empty: false,
          fieldsResponses: fieldsResponseResult,
          fieldResponseSelected: initialFieldResponse
        }));
      }
    } catch (error) {
      console.error('Error en GetOperationFlow:', error);
    }
  }
  
  function UpdateOperationFlow(flow) {
    UpdateFlow(flow)
      .then(() => {
        setState(prevState => ({
          ...prevState,
          entity: flow
        }));

        const url = `/flow/${flow.id}/edit`;
        navigate(url);
      })
      .catch((error) => {
        console.error('Error updating operation flow:', error);
      });
  }

  // Fields Response
  function InsertOperationFieldsResponse(fieldsResponse) {
    return InsertFieldsResponse(fieldsResponse).then((result) => {
      setState(prevState => ({
        ...prevState,
        fieldsResponses: [...prevState.fieldsResponses, result],
        fieldResponseSelected: result,
        entity: {
          ...prevState.entity,
          fields_response_id: [...prevState.entity.fields_response_id, result.id]
        },
        flows: prevState.flows.map(flow => {
          if (flow.id === state.entity.id) {
            return {
              ...flow,
              fields_response_id: [...flow.fields_response_id, result.id]
            }
          }
          return flow;
        })

      }));
    }).catch((error) => {
      console.error('Error inserting fields response:', error);
    });
  }

  function DeleteOperationFieldsResponse(fieldsResponseId) {
    DeleteFieldsResponse(fieldsResponseId).then((result) => {
      const url = `/flow/${state.entity.id}/edit`;
      navigate(url);
    }).catch((error) => {
      console.error('Error deleting fields response:', error);
    });
  }

  function UpdateOperationFieldsResponse(fieldResponse) {
    UpdateFieldsResponse(fieldResponse).then((result) => {
      setState(prevState => ({
        ...prevState,
        fieldsResponses: prevState.fieldsResponses.map(fr => {
          if (fr.id === fieldResponse.id) {
            return fieldResponse;
          }
          return fr;
        }),
        fieldResponseSelected: result
      }));
    }).catch((error) => {
      console.error('Error updating fields response:', error);
    })  ;
  }


  //
  // Functions

  const processNodeConnections = (nodeId, allNodes, allEdges, processedNodes = new Set()) => {
    if (processedNodes.has(nodeId)) {
      console.log('Nodo ya procesado, retornando null');
      return null;
    }
    processedNodes.add(nodeId);

    const node = allNodes.find(n => n.id === nodeId);
    if (!node) {
      console.log('Nodo no encontrado');
      return null;
    }

    // Encontrar todas las conexiones salientes de este nodo
    const nodeConnections = allEdges.filter(edge => edge.source === nodeId);
    
    // Agrupar conexiones por nodo destino
    const connectionsByTarget = nodeConnections.reduce((acc, connection) => {
      const targetId = connection.target;
      if (!acc[targetId]) {
        acc[targetId] = [];
      }
      acc[targetId].push(connection);
      return acc;
    }, {});

    // Procesar cada nodo destino y sus conexiones
    const relationOperations = Object.entries(connectionsByTarget).map(([targetId, connections]) => {
      const targetNode = allNodes.find(n => n.id === targetId);
      if (!targetNode) return null;

      // Construir relation_fields para todas las conexiones a este nodo
      const relationFields = connections.map(connection => {
        const paramMatch = connection.targetHandle.match(/param-(.*?)-/);
        const paramType = paramMatch ? paramMatch[1] : '';

        // Construir el parent_field con el formato: [Nombre del template]@[json path]
        const sourceField = connection.sourceHandle.replace('resp-', '');
        const parentField = `${node.data.template.name}@${sourceField}`;

        // Extraer solo el último segmento del targetHandle
        const childParameter = connection.targetHandle.split('-').pop();

        return {
          type: paramType,
          parent_field: parentField,
          child_parameter: childParameter
        };
      });

      // Procesar recursivamente las conexiones del nodo destino
      const nestedOperations = processNodeConnections(targetId, allNodes, allEdges, processedNodes);

      return {
        id: "",
        operation_schema_id: targetNode.data.template.id,
        name: targetNode.data.template.name,
        max_concurrency: targetNode.data.template.max_concurrency || 1,
        search_type: targetNode.data.template.search_type || "",
        relation_fields: relationFields,
        relation_operations: nestedOperations || []
      };
    }).filter(Boolean);

    return relationOperations;
  };

  // Constantes para el espaciado
  const LAYOUT_CONFIG = {
    HORIZONTAL_SPACING: 550,
    VERTICAL_SPACING: 250,
    INITIAL_X: 100,
    INITIAL_Y: 100
  };

  // TODO: Ver si se puede optimizar este, aunque no creo que sea lo mas tarde ahora
  function findTemplateAndSchema(templateId, availableSchemas) {
    const selectedSchema = availableSchemas.find(schema => 
      schema.list_templates?.some(t => t.id === templateId)
    );

    const selectedTemplate = selectedSchema?.list_templates?.find(t => 
      t.id === templateId
    );

    return { selectedTemplate, selectedSchema };
  }

  const createTemplateNode = useCallback((template, schema, position, uid, onConnectHandler) => {
    return {
      id: `template-${uid.rnd()}`,
      type: 'template',
      position,
      data: { 
        template: {
          ...template,
          max_concurrency: template.max_concurrency || 1,
          search_type: template.search_type || 'simple'
        },
        responseSchema: schema?.schema || [],
        onConnectHandler
      },
      draggable: true,
      style: {
        width: 400,
        minWidth: 300,
        maxWidth: 800
      }
    };
  }, []);

  function createEdges(relationFields, sourceNode, targetNode, uid) {
    return relationFields.map(relation => {
      const sourceId = relation.type === 'input' ? 'inputs' : sourceNode.id;
      
      const sourceHandle = relation.type === 'input' 
        ? `input-${relation.parent_field}`
        : `resp-${relation.parent_field.split('@')[1]}`;

      const targetHandle = `param-${relation.type}-${relation.child_parameter}`;

      return {
        id: `edge-${uid.rnd()}`,
        source: sourceId,
        target: targetNode.id,
        sourceHandle,
        targetHandle,
      };
    });
  };

  function createInputNode(flow, layoutConfig) {
    return {
      id: 'inputs',
      type: 'input',
      position: { x: layoutConfig.INITIAL_X + 200, y: layoutConfig.INITIAL_Y },
      data: {
        fields: flow.relation_fields.map(relation => ({
          name: relation.parent_field,
          type: 'string'
        }))
      },
      style: {
        width: 200,
        minWidth: 100,
        maxWidth: 800
      },
      draggable: true,
      deletable: false
    };
  };

  function loadTemplateAndOperations({
    templateId,
    level = 0,
    index = 0,
    relationFields = [],
    relationOperations = [],
    parentNode = null,
    nodes,
    newEdges,
    uid,
    availableSchemas,
    onConnectHandler
  }) {
    const { selectedTemplate, selectedSchema } = findTemplateAndSchema(templateId, availableSchemas);

    if (!selectedTemplate) {
      console.warn('No se encontró el template:', templateId);
      return null;
    }

    const position = {
      x: LAYOUT_CONFIG.INITIAL_X + (level + 1) * LAYOUT_CONFIG.HORIZONTAL_SPACING,
      y: LAYOUT_CONFIG.INITIAL_Y + index * LAYOUT_CONFIG.VERTICAL_SPACING
    };

    const templateNode = createTemplateNode(selectedTemplate, selectedSchema, position, uid, onConnectHandler);
    nodes.push(templateNode);

    // Crear y agregar edges
    const edges = createEdges(relationFields, parentNode || nodes[nodes.length - 2], templateNode, uid);
    newEdges.push(...edges);

    // Procesar operaciones anidadas
    if (relationOperations && relationOperations.length > 0) {
      relationOperations.forEach((operation, childIndex) => {
        loadTemplateAndOperations({
          templateId: operation.operation_schema_id,
          level: level + 1,
          index: childIndex,
          relationFields: operation.relation_fields,
          relationOperations: operation.relation_operations,
          parentNode: templateNode,
          nodes,
          newEdges,
          uid,
          availableSchemas,
          onConnectHandler
        });
      });
    }

    return templateNode;
  }

  function LoadNodes(flow, availableSchemas) {
    const nodes = [];
    const newEdges = [];
    const uid = new ShortUniqueId();

    // Crear nodo input
    const inputNode = createInputNode(flow, LAYOUT_CONFIG);
    nodes.push(inputNode);

    // Iniciar la carga si hay un operation_schema_id
    if (flow.operation_schema_id) {
      loadTemplateAndOperations({
        templateId: flow.operation_schema_id,
        relationFields: flow.relation_fields,
        relationOperations: flow.relation_operations,
        nodes,
        newEdges,
        uid,
        availableSchemas,
        onConnectHandler
      });
    }
    
    setNodes(nodes);
    edgesRef.current = newEdges;
  }

  const TemplateNodeComponent = useMemo(() => 
    React.memo(props => (
      <TemplateNode
        {...props}
      />
    ), (prevProps, nextProps) => {
      return prevProps.id === nextProps.id && 
             prevProps.data.template.id === nextProps.data.template.id &&
             prevProps.data.template.name === nextProps.data.template.name;
    }), 
  []);

  const InputNodeComponent = useCallback(props => (
    <InputNode
      {...props}
      updateNodeData={(newData) => handleInputNodeUpdate(props.id, newData)}
    />
  ), [handleInputNodeUpdate]);

  const nodeTypes = useMemo(() => ({
    template: TemplateNodeComponent,
    input: InputNodeComponent
  }), [TemplateNodeComponent, InputNodeComponent]);


  return (
    <Layout style={{ height: '100vh' }}>
      <FlowSidebar
        schemas={schemas}
        flows={state.flows}
        fieldsResponses={state.fieldsResponses}
        fieldResponseSelected={fieldResponseSelected}
        onAddFlow={handleAddFlow}
        onDeleteFlow={handleDeleteFlow}
        onRenameFlow={handleRenameFlow}
        onFlowSelect={handleFlowSelect}
        onTemplateSelect={handleTemplateSelect}
        onFieldsResponseSelect={handleFieldsResponseSelect}
        onAddFieldResponse={handleAddFieldResponse}
        onDeleteFieldResponse={handleDeleteFieldResponse}
        onRenameFieldResponse={handleRenameFieldResponse}
      />
      <Layout>
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <FlowToolbar 
            onSave={handleSaveFlow}
            data={{ name: state.entity.name }} 
          />
          <ReactFlow 
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnectHandler}
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
