import { fetchGrantsInsideShape } from "../../../../services/shapes";

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

    let title1, title2;

    // Verifica qual shape está sendo solicitada e seu código específico.
    if (shape.shapeName === 'bacias_hidrograficas') {
        console.log('sh name = bacia')
        title1 = `Nome da Bacia: ${shape.bacia_nome}`;
        title2 = `Bacia Código: ${shape.bacia_cod}`
    } else if (shape.shapeName === 'unidades_hidrograficas') {
        title1 = `Nome da UH: ${shape.uh_nome}`;
        title2 = `${shape.uh_label}`
    } else if (shape.shapeName === 'hidrogeo_poroso') {
        title1 = `Sistema: ${shape.sistema}`;
        title2 = `Código: ${shape.cod_plan}`;
    } else {
        title1 = `Sistema: ${shape.sistema}, Subsistema: ${shape.subsistema}`;
        title2 = `Código: ${shape.cod_plan}`;
    }

    // Cria os elementos div para exibir o tipo e descrição.
    const titleDiv1 = document.createElement('div');
    // bacia
    titleDiv1.textContent = `${title1}`;
    // Cria os elementos div para exibir o tipo e descrição.
    const titleDiv2 = document.createElement('div');
    // bacia
    titleDiv2.textContent = `${title2}`;

    titleDiv.appendChild(titleDiv1);
    titleDiv.appendChild(titleDiv2);

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
          },
          .custom-button {
              background-color: ${bgColor};
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
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
    //subtitleDiv.textContent = `${'subtitle'}`;

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
    pInfo1.textContent = `${title1}`;

    const pInfo2 = document.createElement('p');
    pInfo2.textContent = `${title2}`;

    const btnSearch = document.createElement('button');
    btnSearch.innerHTML = 'Buscar Outorgas';
    btnSearch.className = 'custom-button'
    btnSearch.addEventListener("click", function () {
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