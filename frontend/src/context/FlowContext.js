import { createContext, useContext } from 'react';

export const FlowContext = createContext(null);

export const useFlowContext = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlowContext must be used within a FlowProvider');
  }
  return context;
}; 