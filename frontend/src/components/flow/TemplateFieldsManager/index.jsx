import React, { useMemo, useCallback } from 'react';
import { useTemplateFields } from '../../../context/TemplateFieldsContext';

const TemplateFieldsManager = ({ templateName, fieldResponseId, children }) => {
  const { templateFields, toggleField } = useTemplateFields();
  
  const templateKey = useMemo(() => 
    `${templateName}-${fieldResponseId}`,
    [templateName, fieldResponseId]
  );
  
  const templateSpecificFields = useMemo(() => 
    templateFields.get(templateKey) || [],
    [templateFields, templateKey]
  );

  const handleFieldSelect = useCallback((fieldPath, isChecked) => {
    toggleField(templateName, fieldPath, isChecked, fieldResponseId);
  }, [templateName, fieldResponseId, toggleField]);

  return children({ 
    fields: templateSpecificFields,
    onFieldSelect: handleFieldSelect 
  });
};

export default React.memo(TemplateFieldsManager); 