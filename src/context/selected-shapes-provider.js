import React, { createContext, useContext, useState } from 'react';

const SelectedShapesContext = createContext();

export const SelectedShapesProvider = ({ children }) => {
  const [selectedShapes, setSelectedShapes] = useState(['subterranea', 'superficial', 'lancamento_pluviais', 'lancamento_efluentes', 'barragem']);

  return (
    <SelectedShapesContext.Provider value={{ selectedShapes, setSelectedShapes }}>
      {children}
    </SelectedShapesContext.Provider>
  );
};

export const useSelectedShapes = () => {
  return useContext(SelectedShapesContext);
};
