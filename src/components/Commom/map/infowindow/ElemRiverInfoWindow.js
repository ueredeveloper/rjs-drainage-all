
import React from "react";

/**
 * Componente para criar conteúdo HTML do InfoWindow de rios
 * @param {Object} riverData - Dados do rio vindos da API
 * @returns {string} HTML formatado para o InfoWindow
 */
export const createRiverInfoWindowContent = (riverData) => {
  const styles = {
    container: `
      padding: 15px;
      max-width: 350px;
      font-family: 'Roboto', Arial, sans-serif;
      line-height: 1.4;
    `,
    title: `
      margin: 0 0 12px 0;
      color: #1976d2;
      font-size: 18px;
      font-weight: 500;
      border-bottom: 2px solid #e3f2fd;
      padding-bottom: 8px;
    `,
    grid: `
      display: grid;
      gap: 8px;
      margin-top: 10px;
    `,
    item: `
      margin: 0;
      padding: 4px 0;
      font-size: 14px;
    `,
    label: `
      font-weight: 600;
      color: #424242;
    `,
    value: `
      color: #666;
      margin-left: 5px;
    `
  };

  // Função auxiliar para criar um item de informação
  const createInfoItem = (label, value) => {
    if (!value) return '';
    return `
      <p style="${styles.item}">
        <span style="${styles.label}">${label}:</span>
        <span style="${styles.value}">${value}</span>
      </p>
    `;
  };

  return `
    <div style="${styles.container}">
      <h3 style="${styles.title}">📍 Informações do Rio</h3>
      <div style="${styles.grid}">
        ${createInfoItem('Nome', riverData.nome_do_rio || riverData.nome || riverData.name)}
        ${createInfoItem('Código', riverData.codigo || riverData.code)}
        ${createInfoItem('Tipo', riverData.tipo || riverData.type)}
        ${createInfoItem('Bacia', riverData.bacia || riverData.basin)}
        ${createInfoItem('Sub-bacia', riverData.sub_bacia || riverData.sub_basin)}
        ${createInfoItem('Comprimento', riverData.comprimento ? `${riverData.comprimento} km` : '')}
        ${createInfoItem('Ordem', riverData.ordem || riverData.order)}
        ${createInfoItem('Município', riverData.municipio || riverData.city)}
        ${createInfoItem('Estado', riverData.estado || riverData.state)}
        ${createInfoItem('Região', riverData.regiao || riverData.region)}
        ${createInfoItem('Coordenadas', riverData.coordinates ? `${riverData.coordinates.lat}, ${riverData.coordinates.lng}` : '')}
      </div>
    </div>
  `;
};

export default { createRiverInfoWindowContent };
