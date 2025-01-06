import React, { createContext, useContext, useState } from 'react';

const FlowContext = createContext(null);

export function FlowProvider({ children }) {
  const [fieldResponseSelected, setFieldResponseSelected] = useState(null);

  const value = {
    fieldResponseSelected,
    setFieldResponseSelected
  };

  return (
    <FlowContext.Provider value={value}>
      {children}
    </FlowContext.Provider>
  );
}

export function useFlowContext() {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlowContext must be used within a FlowProvider');
  }
  return context;
} 