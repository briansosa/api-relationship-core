import React, { createContext, useContext, useState, useCallback } from 'react';

const TemplateFieldsContext = createContext(null);

export function TemplateFieldsProvider({ children }) {
  const [templateFields, setTemplateFields] = useState(new Map());

  // Funciones de conversión
  const convertToTemplateFields = useCallback((fieldResponse) => {
    if (!fieldResponse) return new Map();
    
    return fieldResponse.fields_response.reduce((map, field) => {
      const templateKey = `${field.operation_name}-${fieldResponse.id}`;
      const currentFields = map.get(templateKey) || [];
      if (!currentFields.includes(field.field_response)) {
        map.set(templateKey, [...currentFields, field.field_response]);
      }
      return map;
    }, new Map());
  }, []);

  const convertToFieldResponse = useCallback((templateFields, fieldResponse) => {
    if (!fieldResponse) return [];
    
    return Array.from(templateFields.entries()).flatMap(([key, fields]) => {
      const [templateName] = key.split('-');
      return fields.map(field => ({
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
      const newMap = new Map(prevFields);
      const templateKey = `${templateName}-${fieldResponseId}`;
      const currentFields = newMap.get(templateKey) || [];

      if (isChecked) {
        if (currentFields.some(f => f === fieldPath)) return prevFields;
        newMap.set(templateKey, [...currentFields, fieldPath]);
      } else {
        newMap.set(templateKey, currentFields.filter(f => f !== fieldPath));
      }

      return newMap;
    });
  }, []);

  const isFieldSelected = useCallback((templateName, fieldPath, fieldResponseId) => {
    if (!fieldResponseId) return false;
    const templateKey = `${templateName}-${fieldResponseId}`;
    const fields = templateFields.get(templateKey) || [];
    return fields.includes(fieldPath);
  }, [templateFields]);

  const value = {
    templateFields,
    updateTemplateFields,
    toggleField,
    isFieldSelected,
    convertToFieldResponse
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