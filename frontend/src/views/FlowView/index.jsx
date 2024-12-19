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
import { InsertFieldsResponse, GetFieldsResponseByFlowID, UpdateFieldsResponse } from '../../../wailsjs/go/handlers/FieldsResponseHandler';

// Definimos nodeTypes fuera del componente
const NODE_TYPES = {
  template: TemplateNode,
  input: InputNode
};


// Datos hardcodeados para FieldsResponse
const MOCK_FIELDS_RESPONSE = [
  {
    id: "1",
    name: "Ubicación completa",
    fields_response: [
      {
        operation_name: "locacion",
        field_response: "ubicacion.departamento.nombre"
      },
      {
        operation_name: "ubicacion",
        field_response: "direccionesNormalizadas.#.coordenadas.x"
      }
    ]
  },
  {
    id: "2",
    name: "Datos básicos",
    fields_response: [
      {
        operation_name: "locacion",
        field_response: "ubicacion.provincia.nombre"
      },
      {
        operation_name: "ubicacion",
        field_response: "direccionesNormalizadas.#.nombre_localidad"
      }
    ]
  },
  {
    id: "3",
    name: "Datos básico hardcoded",
    fields_response: [
    ]
  }
];

const FlowView = () => {  
  const urlParams = useParams();
  const navigate = useNavigate();

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

  const entityInitFieldsResponse = {
    id: "0",
    name: "",
    flow_id: "",
    fields_response: []
  };

  // Nuevo estado para Fields Response
  const [fieldsResponses, setFieldsResponses] = useState(MOCK_FIELDS_RESPONSE);
  
  // Hooks
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [schemas, setSchemas] = useState([]);
  const [state, setState] = useState({
    entity: entityInit,
    id: urlParams.id ? urlParams.id : "0",
    flows: [],
    disable: true,
    fieldsResponses: [],
    fieldResponseSelected: entityInitFieldsResponse
  });

  const edgesRef = useRef([]);


  useEffect(() => {    
    if (!urlParams.id && !urlParams.mode) {
      GetAllOperationsFlow();
    }

    if (urlParams.id !== "0" && urlParams.mode === "edit") {
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
      setEdges(edgesRef.current);
      edgesRef.current = [];
    }
  }, [nodes]);

   // Manejador para cuando se selecciona un checkbox en TemplateNode
   const handleFieldSelect = useCallback((templateName, fieldPath, isChecked) => {
     console.log("entrando a handleFieldSelect");
     if (!state.fieldResponseSelected) return;

    let newFields = [];
    if (isChecked) {
      newFields = [
        ...state.fieldResponseSelected.fields_response, // Cambié 'fieldsResponses' a 'fieldResponseSelected'
        {
          operation_name: templateName,
          field_response: fieldPath
        }
      ];
    } else {
      newFields = state.fieldResponseSelected.fields_response.filter(f => 
        !(f.operation_name === templateName && f.field_response === fieldPath)
      );
    }

    console.log("newFields", newFields);

    setState(prevState => ({
      ...prevState,
      fieldResponseSelected: {
        ...prevState.fieldResponseSelected,
        fields_response: newFields
      }
    }));


  }, [state.fieldResponseSelected]);

  // Función para verificar si un campo está seleccionado
  const isFieldSelected = useCallback((templateName, fieldPath) => {
    if (!state.fieldResponseSelected) return false;

    const isSelected = state.fieldResponseSelected.fields_response.some(f => 
      f.operation_name === templateName && f.field_response === fieldPath
    );

    return isSelected;
  }, [state.fieldResponseSelected]);

  // Memoizamos nodeTypes después de definir las funciones necesarias
  const nodeTypes = useMemo(() => ({
    template: props => (
      <TemplateNode
        {...props}
        onFieldSelect={handleFieldSelect}
        isFieldSelected={isFieldSelected}
      />
    ),
    input: (props) => (
      <InputNode
        {...props}
        updateNodeData={(newData) => {
          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === props.id) {
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
        }}
      />
    ),
  }), [handleFieldSelect, isFieldSelected, setNodes]);


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

  // Manejador para eliminar nodos
  const handleNodesDelete = useCallback((nodesToDelete) => {
    setNodes(nodes => nodes.filter(node => 
      !nodesToDelete.find(n => n.id === node.id)
    ));
  }, [setNodes]);


  const handleAddFlow = () => {
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
  };

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

    UpdateOperationFlow(flowEntity);
  };

  const handleFieldsResponseSelect = (fieldResponseId) => {
    const fieldResponseEntity = state.fieldsResponses.find(fr => fr.id === fieldResponseId);
    
    console.log("handleFieldsResponseSelect", fieldResponseEntity);
    setState(prevState => ({
      ...prevState,
      fieldResponseSelected: fieldResponseEntity
    }));
  };

  // Función auxiliar para procesar un nodo y sus conexiones
  const processNodeConnections = (nodeId, allNodes, allEdges) => {
    const node = allNodes.find(n => n.id === nodeId);
    if (!node) return null;

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
        const parentField = `${node.data.template.name}@${buildJsonPath(sourceField, node.data.responseSchema)}`;

        // Extraer solo el último segmento del targetHandle
        const childParameter = connection.targetHandle.split('-').pop();

        return {
          type: paramType,
          parent_field: parentField,
          child_parameter: childParameter
        };
      });

      // Procesar recursivamente las conexiones del nodo destino
      const nestedOperations = processNodeConnections(targetId, allNodes, allEdges);

      return {
        id: "",
        operation_schema_id: targetNode.data.template.id,
        name: targetNode.data.template.name,
        max_concurrency: targetNode.data.template.max_concurrency || 1,
        search_type: targetNode.data.template.search_type || "",
        relation_fields: relationFields,
        relation_operations: nestedOperations || [] // Incluir las operaciones anidadas
      };
    }).filter(Boolean);

    return relationOperations;
  };

  // Función auxiliar para construir el JSON path
  const buildJsonPath = (field, schema) => {
    if (!schema) return field;

    // Función recursiva para encontrar la ruta completa
    const findPath = (currentSchema, targetField, currentPath = '') => {
      if (!currentSchema || typeof currentSchema !== 'object') return null;

      // Buscar en las propiedades del objeto
      for (const [key, value] of Object.entries(currentSchema)) {
        // Si encontramos el campo objetivo
        if (key === targetField) {
          return currentPath ? `${currentPath}.${key}` : key;
        }

        // Si es un array, incluimos el nombre de la propiedad y el #
        if (Array.isArray(value)) {
          const result = findPath(value[0], targetField, currentPath ? `${currentPath}.${key}.#` : `${key}.#`);
          if (result) return result;
        }
        // Si es un objeto, seguimos buscando
        else if (typeof value === 'object') {
          const result = findPath(value, targetField, currentPath ? `${currentPath}.${key}` : key);
          if (result) return result;
        }
      }

      return null;
    };

    const path = findPath(schema, field);
    return path || field;
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

    // Construir relation_fields basado en las conexiones del input
    const relationFields = inputConnections.map(connection => {
      const parentField = connection.sourceHandle.replace('input-', '');
      
      // Extraer solo el último segmento del targetHandle
      const childParameter = connection.targetHandle.split('-').pop();

      return {
        type: "input",
        parent_field: parentField,
        child_parameter: childParameter
      };
    });

    // Procesar las conexiones del primer nodo template
    const relationOperations = processNodeConnections(firstTemplateNode.id, nodes, edges);

    // Construir la entidad a guardar
    const flowEntity = {
      id: state.entity.id,
      operation_schema_id: firstTemplateNode.data.template.id,
      name: state.entity.name,
      max_concurrency: firstTemplateNode.data.template.max_concurrency || 1,
      search_type: firstTemplateNode.data.template.search_type || "",
      relation_fields: relationFields,
      relation_operations: relationOperations || [],
      fields_response_id: state.entity.fields_response_id
    };

    console.log('Entidad a guardar:', flowEntity);
    console.log('Fields response guardar:', state.fieldResponseSelected);
    
    UpdateFieldsResponse(state.fieldResponseSelected).then(() => {
      UpdateOperationFlow(flowEntity);
    }).catch((error) => {
      console.error('Error updating fields response:', error);
    });
    
  };

  // Functions

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

  function InsertOperationFieldsResponse(flowId) {
    const uid = new ShortUniqueId();
    
    const fieldsResponse = {
      id: uid.rnd(),
      name: "New Fields Response",
      flow_id: flowId,
      fields_response: []
    }

    InsertFieldsResponse(fieldsResponse).then((result) => {
      console.log("result fields response", result);
      setState(prevState => ({
        ...prevState,
        fieldsResponses: [...prevState.fieldsResponses, result]
      }));
    }).catch((error) => {
      console.error('Error inserting fields response:', error);
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

        InsertOperationFieldsResponse(result.id);

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
      })
      .catch((error) => {
        console.error('Error inserting operation flow:', error);
      });
  }

  function GetOperationFlow(id) {
    GetFlow(id)
      .then(flowResult => {

        console.log("get operation flow", flowResult);
        setState(prevState => ({
          ...prevState,
          entity: flowResult,
          disable: false,
          empty: false
        }));

        GetAllSchemasWithTemplates().then((schemasResult) => {
          setSchemas(schemasResult);
          LoadNodes(flowResult, schemasResult);
        });

        GetAllOperationsFlow();

        GetFieldsResponseByFlowID(flowResult.id)
          .then((fieldsResponseResult) => {
            setState(prevState => ({
              ...prevState,
              fieldsResponses: fieldsResponseResult,
              fieldResponseSelected: fieldsResponseResult.length > 0 ? fieldsResponseResult[0] : prevState.fieldResponseSelected
            }));
            console.log("fields response", fieldsResponseResult);
          })
          .catch((error) => {
            console.error('Error getting fields response by flow id:', error);
          });
      })
      .catch((error) => {
        console.error('Error en GetOperationFlow:', error);
      });
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

  function LoadNodes(flow, availableSchemas) {
    const nodes = [];
    const newEdges = [];
    const uid = new ShortUniqueId();

    // Constantes para el espaciado
    const HORIZONTAL_SPACING = 550; // Espacio horizontal entre nodos
    const VERTICAL_SPACING = 250;   // Espacio vertical entre nodos del mismo nivel
    const INITIAL_X = 100;          // Posición X inicial
    const INITIAL_Y = 100;          // Posición Y inicial

    // Agregar el nodo input con sus propiedades
    const inputNode = {
      id: 'inputs',
      type: 'input',
      position: { x: INITIAL_X + 200, y: INITIAL_Y },
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
    nodes.push(inputNode);

    const loadTemplateAndOperations = (templateId, level = 0, index = 0, relationFields = [], relationOperations = []) => {
      // Usar los schemas pasados como parámetro en lugar del estado
      let selectedTemplate = null;
      let selectedSchema = null;

      availableSchemas.forEach(schema => {
        const template = schema.list_templates?.find(t => t.id === templateId);
        if (template) {
          selectedTemplate = template;
          selectedSchema = schema;
        }
      });

      if (!selectedTemplate) {
        console.warn('No se encontró el template:', templateId);
        return null;
      }

      // Calcular la posición basada en el nivel y el índice
      const position = {
        x: INITIAL_X + (level + 1) * HORIZONTAL_SPACING,
        y: INITIAL_Y + index * VERTICAL_SPACING
      };

      // Crear el nodo template con la nueva posición
      const templateNode = {
        id: `template-${uid.rnd()}`,
        type: 'template',
        position,
        data: { 
          template: {
            ...selectedTemplate,
            max_concurrency: selectedTemplate.max_concurrency || 1,
            search_type: selectedTemplate.search_type || 'simple'
          },
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
      nodes.push(templateNode);

      // Crear las conexiones basadas en relation_fields
      relationFields.forEach(relation => {
        const sourceId = relation.type === 'input' ? 'inputs' : nodes[nodes.length - 2].id;
        
        // Construir los IDs de los handles
        let sourceHandle, targetHandle;
        
        if (relation.type === 'input') {
          sourceHandle = `input-${relation.parent_field}`;
          targetHandle = `param-${relation.type}-${relation.child_parameter}`;
        } else {
          // Para conexiones entre templates, extraer el último campo del path
          const fieldPath = relation.parent_field.split('@')[1];
          sourceHandle = `resp-${fieldPath}`;
          targetHandle = `param-${relation.type}-${relation.child_parameter}`;
        }

        const edge = {
          id: `edge-${uid.rnd()}`,
          source: sourceId,
          target: templateNode.id,
          sourceHandle,
          targetHandle,
        };
        
        newEdges.push(edge);
      });

      // Procesar recursivamente las operaciones relacionadas
      if (relationOperations && relationOperations.length > 0) {
        relationOperations.forEach((operation, childIndex) => {
          loadTemplateAndOperations(
            operation.operation_schema_id,
            level + 1,
            childIndex,
            operation.relation_fields,
            operation.relation_operations
          );
        });
      }

      return templateNode;
    };

    // Si hay un operation_schema_id, cargar el primer template y sus operaciones
    if (flow.operation_schema_id) {
      loadTemplateAndOperations(
        flow.operation_schema_id,
        0,
        0,
        flow.relation_fields,
        flow.relation_operations
      );
    }

    setNodes(nodes);
    edgesRef.current = newEdges;
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <FlowSidebar
        schemas={schemas}
        flows={state.flows}
        fieldsResponses={state.fieldsResponses}
        fieldResponseSelected={state.fieldResponseSelected}
        onAddFlow={handleAddFlow}
        onDeleteFlow={handleDeleteFlow}
        onRenameFlow={handleRenameFlow}
        onFlowSelect={handleFlowSelect}
        onTemplateSelect={handleTemplateSelect}
        onFieldsResponseSelect={handleFieldsResponseSelect}

        // este es para el modal y el rename
        setFieldsResponses={setFieldsResponses}
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
