import React, { createContext, useContext, useState, useCallback } from 'react';
import { useFlowContext } from './FlowContext';

const TemplateFieldsContext = createContext(null);

export function TemplateFieldsProvider({ children }) {
  const [templateFields, setTemplateFields] = useState(new Map());
  const { fieldResponseSelected, setFieldResponseSelected } = useFlowContext();

  // Funciones de conversión
  const convertToTemplateFields = useCallback((fieldResponse) => {
    if (!fieldResponse) return new Map();
    
    return fieldResponse.fields_response.reduce((map, field) => {
      const templateKey = `${field.operation_name}-${fieldResponse.id}`;
      const currentFields = map.get(templateKey) || new Set();
      if (!currentFields.has(field.field_response)) {
        currentFields.add(field.field_response);
      }
      map.set(templateKey, currentFields);
      return map;
    }, new Map());
  }, []);

  const convertToFieldResponse = useCallback((templateFields, fieldResponse) => {
    if (!fieldResponse) return [];
    
    return Array.from(templateFields.entries()).flatMap(([key, fields]) => {
      const [templateName] = key.split('-');
      return Array.from(fields).map(field => ({
        operation_name: templateName,
        field_response: field
      }));
    });
  }, []);

  // Funciones para manejar los campos
  const updateTemplateFields = useCallback((fieldResponse) => {
    if (!fieldResponse) return;
    const newFields = convertToTemplateFields(fieldResponse);
    
    setTemplateFields(newFields);
  }, [convertToTemplateFields]);

  const toggleField = useCallback((templateName, fieldPath, isChecked, fieldResponseId) => {
    if (!fieldResponseId) return;
    
    setTemplateFields(prevFields => {
      const templateKey = `${templateName}-${fieldResponseId}`;
      const currentFields = prevFields.get(templateKey) || new Set();
      
      if (isChecked && currentFields.has(fieldPath)) return prevFields;
      if (!isChecked && !currentFields.has(fieldPath)) return prevFields;
      
      const newFields = new Set(currentFields);
      if (isChecked) {
        newFields.add(fieldPath);
      } else {
        newFields.delete(fieldPath);
      }
      
      const newMap = new Map(prevFields);
      newMap.set(templateKey, newFields);

      // Actualizar también fieldResponseSelected
      if (fieldResponseSelected) {
        const updatedFields = convertToFieldResponse(newMap, fieldResponseSelected);
        setFieldResponseSelected({
          ...fieldResponseSelected,
          fields_response: updatedFields
        });
      }
      
      return newMap;
    });
  }, [fieldResponseSelected, setFieldResponseSelected, convertToFieldResponse]);

  const isFieldSelected = useCallback((templateName, fieldPath, fieldResponseId) => {
    if (!fieldResponseId) return false;    
    const templateKey = `${templateName}-${fieldResponseId}`;
    const fields = templateFields.get(templateKey) || new Set();
    return fields.has(fieldPath);
  }, [templateFields]);

  const getFieldsResponse = useCallback((fieldResponseSelected) => {
    if (!fieldResponseSelected) return [];
    return convertToFieldResponse(templateFields, fieldResponseSelected);
  }, [templateFields, convertToFieldResponse]);

  const value = {
    templateFields,
    updateTemplateFields,
    toggleField,
    isFieldSelected,
    convertToFieldResponse,
    getFieldsResponse
  };

  return (
    <TemplateFieldsContext.Provider value={value}>
      {children}
    </TemplateFieldsContext.Provider>
  );
}

export function useTemplateFields() {
  const context = useContext(TemplateFieldsContext);
  if (!context) {
    throw new Error('useTemplateFields must be used within a TemplateFieldsProvider');
  }
  return context;
} 