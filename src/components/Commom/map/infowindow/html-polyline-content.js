
/**
 * Conteúdo do InfoWindow da Polyline.
 * @component
 * @param {google.maps.Polyline} polyline - A polyline
 * @param {object} shape - As informações da shape
 * @param {google.maps.Map} map - O mapa
 * @param {string} color - Cor primária do tema
 */
const HTMLPolylineContent = (polyline, shape, map, color) => {

    // Cria o elemento div para o container da janela de informações.
    const containerDiv = document.createElement('div');
    containerDiv.id = 'pl-container';

    // Cria o elemento div para o título.
    const titleDiv = document.createElement('div');
    titleDiv.id = 'pl-title';
    titleDiv.textContent = shape.properties?.name || 'Informações da Linha';

    // Cria um elemento <style> para definir os estilos CSS.
    const styleElement = document.createElement('style');

    const setStyles = (bgColor) => {
        return `
          #pl-container {
                width: 100%;
                min-height: 200px;
            }
          #pl-title {
              font-family: 'Open Sans Condensed', sans-serif;
              font-size: 18px;
              font-weight: 400;
              padding: 10px;
              background-color: ${bgColor};
              color: white;
              margin: 0;
              text-align: center;
          }
          #pl-overflow {
              overflow-y: auto;
              overflow-x: hidden;
          }
          #pl-info {
              font-size: 13px;
              line-height: 18px;
              font-weight: 400;
              padding: 15px;
              max-height: 140px;
          }
          #pl-info p {
              margin: 5px 0;
          }
        `;
    };

    styleElement.textContent = setStyles(color);

    // Adiciona o <style> ao <head> do documento.
    document.head.appendChild(styleElement);

    // Cria o elemento div para o conteúdo rolável.
    const overflowDiv = document.createElement('div');
    overflowDiv.id = 'pl-overflow';

    // Cria o elemento div para o conteúdo das informações.
    const infoContentDiv = document.createElement('div');
    infoContentDiv.id = 'pl-info';

    // Calcula o comprimento da polyline
    let totalDistance = 0;
    const path = polyline.getPath();
    if (path && path.getLength() > 1) {
        for (let i = 0; i < path.getLength() - 1; i++) {
            totalDistance += window.google.maps.geometry.spherical.computeDistanceBetween(
                path.getAt(i),
                path.getAt(i + 1)
            );
        }
    }

    // Formatar distância
    const formatDistance = (distance) => {
        if (distance >= 1000) {
            return `${(distance / 1000).toFixed(2)} km`;
        }
        return `${distance.toFixed(2)} m`;
    };

    // Criar elementos de informação

    //tipo
    
    const typeInfo = document.createElement('p');
    typeInfo.textContent = `Tipo: ${shape.properties?.type || 'Linha'}`;

    //comprimento

    const lengthInfo = document.createElement('p');
    lengthInfo.textContent = `Comprimento: ${formatDistance(totalDistance)}`;

    //pontos

    const pointsInfo = document.createElement('p');
    pointsInfo.textContent = `Pontos: ${path ? path.getLength() : 0}`;

    //descrição

    const descriptionInfo = document.createElement('p');
    descriptionInfo.textContent = `Descrição: ${shape.properties?.description || 'Linha geométrica'}`;

    // Adicionar informações sobre coordenadas se disponível
    if (shape.geometry && shape.geometry.coordinates) {
        const coordsInfo = document.createElement('p');
        const coordsCount = shape.geometry.coordinates.length;
        coordsInfo.textContent = `Coordenadas: ${coordsCount} pontos`;
        infoContentDiv.appendChild(coordsInfo);
    }

    // Adiciona os elementos ao div de conteúdo.
    infoContentDiv.appendChild(typeInfo);
    infoContentDiv.appendChild(lengthInfo);
    infoContentDiv.appendChild(pointsInfo);
    infoContentDiv.appendChild(descriptionInfo);

    // Adiciona todos os elementos ao div do container.
    containerDiv.appendChild(titleDiv);
    overflowDiv.appendChild(infoContentDiv);
    containerDiv.appendChild(overflowDiv);

    // Retorna o elemento div completo.
    return containerDiv;
}

export default HTMLPolylineContent;
