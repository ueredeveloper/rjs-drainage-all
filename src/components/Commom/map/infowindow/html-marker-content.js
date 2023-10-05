import { setInfoMarkerIcon } from "../../../../tools";

/**
 * Conteúdo da Infowindow (ElemMarkerInfoWindow).
 * @component
 * @param {string} color Cor em formato rex color, ex: #ffffff.
 * @param {object} info Informações do marcador. 
 */
const HTMLMarkerContent = (color, info) => {

    console.log(color, info)

    // Obtém os dados do ícone para a janela de informações.
    let svgData = setInfoMarkerIcon(info.id, info.ti_id, info.tp_id).iw;

    // Cria um elemento object para renderizar a imagem SVG.
    const image = document.createElement('object');
    image.setAttribute('type', 'image/svg+xml');
    image.setAttribute('data', `data:image/svg+xml,${encodeURIComponent(svgData)}`);
    image.style.width = '70px';
    image.style.height = '70px';

    // Cria o elemento div para o container da janela de informações.
    const containerDiv = document.createElement('div');
    containerDiv.id = 'wi-container';

    // Cria o elemento div para o título.
    const titleDiv = document.createElement('div');
    titleDiv.id = 'wi-title';

    // Cria os elementos div para exibir o tipo e descrição.
    const tittleType = document.createElement('div');
    tittleType.textContent = info.ti_descricao;
    const wellType = document.createElement('div');
    wellType.textContent = info.tp_descricao;
    titleDiv.appendChild(tittleType);
    titleDiv.appendChild(wellType);

    // Cria um elemento <style> para definir os estilos CSS.
    const styleElement = document.createElement('style');

    // Set the CSS styles

    const setStyles = (bgColor) => {
        return `
          #wi-container {
                width: 100%;
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
    subtitleDiv.appendChild(image);

    // Cria o elemento div para o conteúdo das informações.
    const infoContentDiv = document.createElement('div');
    infoContentDiv.id = 'wi-info';
    const infoTextDiv = document.createElement('div');

    // Cria os elementos <p> para cada propriedade e define o conteúdo de texto.
    const nome = document.createElement('p');
    nome.textContent = `Nome: ${info.us_nome}`;

    const cpfCnpj = document.createElement('p');
    cpfCnpj.textContent = `CPF: ${info.us_cpf_cnpj}`;

    const numAto = document.createElement('p');
    numAto.textContent = `Número do Ato: ${info.int_num_ato}`;

    const endereco = document.createElement('p');
    endereco.textContent = `Endereço: ${info.emp_endereco}`;

    const processo = document.createElement('p');
    processo.textContent = `Processo: ${info.int_processo}`;

    const coordenadas = document.createElement('p');
    coordenadas.textContent = `Coordenadas: ${info.int_latitude}, ${info.int_longitude}`;

    const bacia = document.createElement('p');
    bacia.textContent = `Bacia Hidrográfica: ${info.bh_nome}`;

    const unidade = document.createElement('p');
    unidade.textContent = `Unidade Hidrográfica: ${info.uh_nome}`;

    // Adiciona os elementos <p> ao div de texto das informações.
    infoTextDiv.appendChild(nome);
    infoTextDiv.appendChild(cpfCnpj);
    infoTextDiv.appendChild(numAto);
    infoTextDiv.appendChild(endereco);
    infoTextDiv.appendChild(processo);
    infoTextDiv.appendChild(coordenadas);
    infoTextDiv.appendChild(bacia);
    infoTextDiv.appendChild(unidade);

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

export default HTMLMarkerContent;