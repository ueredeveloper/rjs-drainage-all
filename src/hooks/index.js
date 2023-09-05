/**
 * Módulo DataContext.js
 * 
 * Este módulo define o contexto de dados compartilhados para gerenciar o estado 'selectedsCharts'.
 * Ele fornece o DataProvider para envolver a aplicação e o hook useData para acessar o estado.
 */

import React, { createContext, useContext, useState } from 'react';

// Criação de um contexto para o estado compartilhado
const DataContext = createContext();

/**
 * Provedor de Dados
 * 
 * Um componente que fornece o estado 'selectedsCharts' para seus componentes filhos.
 * 
 * @param {Object} props - Propriedades do componente.
 * @param {ReactNode} props.children - Os componentes filhos que terão acesso ao estado compartilhado.
 * @returns {JSX.Element} O componente DataProvider.
 */
export const DataProvider = ({ children }) => {
  // Inicializa o estado 'selectedsCharts' com valores padrão
  const [selectedsCharts, setSelectedsCharts] = useState({
    "Pluviais": true,
    "Subterrâneas": true,
    "Superficiais": true,
    "Efluentes": true,
    "Barragens": true
  });

  return (
    // Fornece o estado 'selectedsCharts' para os componentes filhos
    <DataContext.Provider value={{ selectedsCharts, setSelectedsCharts }}>
      {children}
    </DataContext.Provider>
  );
};

/**
 * Hook useData
 * 
 * Um hook personalizado para acessar o estado 'selectedsCharts' a partir do contexto.
 * 
 * @returns {Object} Um objeto que contém o estado 'selectedsCharts' e a função 'setSelectedsCharts'.
 */
export const useData = () => useContext(DataContext);
