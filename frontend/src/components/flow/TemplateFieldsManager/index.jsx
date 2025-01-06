import React, { useMemo, useCallback } from 'react';
import { useTemplateFields } from '../../../context/TemplateFieldsContext';

const TemplateFieldsManager = ({ templateName, fieldResponseId, children }) => {
  const { templateFields, toggleField } = useTemplateFields();
  
  const templateKey = `${templateName}-${fieldResponseId}`;
  const fields = useMemo(() => {
    return templateFields.get(templateKey) || [];
  }, [templateFields, templateKey]);

  const handleFieldSelect = useCallback((fieldPath, isChecked) => {
    toggleField(templateName, fieldPath, isChecked, fieldResponseId);
  }, [templateName, fieldResponseId, toggleField]);

  return children({ 
    fields,
    onFieldSelect: handleFieldSelect 
  });
};

export default React.memo(TemplateFieldsManager); 