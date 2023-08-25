import { useContext } from "react";
import { fetchGrantsInsideShape } from "../../../../services/shapes";
//import { AnalyseContext } from "../../../MainFlow/Analyse";

const HTMLPolygonContent = (polygon, shape, map, setOverlays, color) => {

    /**
  * Obtém concessões dentro de uma forma geográfica e as adiciona ao mapa.
  *
  * @async
  * @param {Object} shape - Informações sobre a forma geográfica.
  * @param {string} shape.shapeName - Nome da forma geográfica.
  * @param {string} shape.bacia_cod - Código da bacia hidrográfica (se aplicável).
  * @param {string} shape.uh_codigo - Código da unidade hidrográfica (se aplicável).
  * @param {string} shape.cod_plan - Código da sistema fraturado ou poroso (se aplicável).
  * @param {google.maps.Map} map - Instância do mapa onde as concessões serão adicionadas.
  * @returns {Promise<void>} - Uma Promise que resolve quando as concessões são adicionadas ao mapa.
  */
    const obtainGrants = async (shape, map) => {
        let shapeCode;
        let shapeName = shape.shapeName;

        // Verifica qual shape está sendo solicitada e seu código específico.
        if (shape.shapeName === 'bacias_hidrograficas') {
            shapeCode = shape.bacia_cod;
        } else if (shape.shapeName === 'unidades_hidrograficas') {
            shapeCode = shape.uh_codigo;
            console.log(shapeCode);
        } else {
            shapeCode = shape.cod_plan;
        }

        let _shape = {
            id: Date.now(),
            type: 'polygon',
            position: null,
            map: map,
            draw: polygon,
            markers: await fetchGrantsInsideShape(shapeName, shapeCode),
            area: null
        };

        setOverlays(prev => {
            return {
                ...prev,
                shapes: [...prev.shapes, _shape]
            };
        });
    }


    // Cria o elemento div para o container da janela de informações.
    const containerDiv = document.createElement('div');
    containerDiv.id = 'wi-container';

    // Cria o elemento div para o título.
    const titleDiv = document.createElement('div');
    titleDiv.id = 'wi-title';

    // Cria os elementos div para exibir o tipo e descrição.
    const tittleType = document.createElement('div');
    // bacia
    tittleType.textContent = `${shape.bacia_nome}`;
    //uh uh_nome
    //tittleType.textContent = `${shape.uh_nome}`;

    titleDiv.appendChild(tittleType);

    // Cria um elemento <style> para definir os estilos CSS.
    const styleElement = document.createElement('style');

    // Set the CSS styles

    const setStyles = (bgColor) => {
        return `
          #wi-container {
                width: 100%;
                min-width: 300px;
                height: 300px;
            }
          #wi-title {
              font-family: 'Open Sans Condensed', sans-serif;
              font-size: 22px;
              font-weight: 400;
              padding: 10px;
              background-color: ${bgColor};
              color: white;
              margin: 0;
              display: flex;
              flex-direction: row;
              justify-content: space-between;
          }
          #wi-overflow {
              overflow-y: auto;
              overflow-x: hidden;
          }
          #wi-subtitle {
              font-size: 16px;
              font-weight: 700;
              padding: 5px 0;
              display: flex;
              flex-direction: row;
              justify-content: space-around;
              align-items: center;
              padding: 10px;
          }
          #wi-info {
              font-size: 13px;
              line-height: 18px;
              font-weight: 400;
              padding: 15px;
              max-height: 140px;
          }
        `;
    };

    styleElement.textContent = setStyles(color);

    // Adiciona o <style> ao <head> do documento.
    document.head.appendChild(styleElement);

    // Cria o elemento div para o conteúdo rolável.
    const overlflowDiv = document.createElement('div');
    overlflowDiv.id = 'wi-overflow';

    // Cria o elemento div para o subtítulo.
    const subtitleDiv = document.createElement('div');
    subtitleDiv.id = 'wi-subtitle';

    // Cria o primeiro div interno do subtítulo.
    const infoDiv = document.createElement('div');
    infoDiv.textContent = 'Informações';

    // Adiciona os elementos div ao subtítulo.
    subtitleDiv.appendChild(infoDiv);
    //subtitleDiv.appendChild(image);

    // Cria o elemento div para o conteúdo das informações.
    const infoContentDiv = document.createElement('div');
    infoContentDiv.id = 'wi-info';
    const infoTextDiv = document.createElement('div');

    // Cria os elementos <p> para cada propriedade e define o conteúdo de texto.
    const pInfo1 = document.createElement('p');
    pInfo1.textContent = `Nome da Bacia: ${shape.bacia_nome}`;

    const pInfo2 = document.createElement('p');
    pInfo2.textContent = `Código: ${shape.bacia_cod}`;

    const btnSearch = document.createElement('button');
    btnSearch.innerHTML = 'Buscar';
    btnSearch.addEventListener("click", function () {
        console.log('obtain grants')
        obtainGrants(shape, map)

    }, false);

    infoTextDiv.appendChild(pInfo1);
    infoTextDiv.appendChild(pInfo2);
    infoTextDiv.appendChild(btnSearch);

    // Adiciona o div de texto das informações ao div de conteúdo.
    infoContentDiv.appendChild(infoTextDiv);

    // Adiciona todos os elementos ao div do container.
    containerDiv.appendChild(titleDiv);
    overlflowDiv.appendChild(subtitleDiv);
    overlflowDiv.appendChild(infoContentDiv);
    containerDiv.appendChild(overlflowDiv);

    // Retorna o elemento div completo.
    return containerDiv;
}

export default HTMLPolygonContent;