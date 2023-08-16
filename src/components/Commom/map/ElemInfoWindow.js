/**
 * Componente para exibir informações em uma janela de informações associada a um marcador no mapa.
 *
 * @param {object} props - Propriedades do componente.
 * @param {google.maps.Marker} props.marker - O marcador ao qual a janela de informações está associada.
 * @param {object} props.info - As informações a serem exibidas na janela.
 * @param {google.maps.Map} props.map - O mapa ao qual o marcador e a janela de informações pertencem.
 * @returns {null} Retorna null, pois este componente não possui renderização visível.
 */
import { createRef, useEffect, useRef, useState } from 'react';
import { iwManualIcon, iwTubularIcon, iwSuperficialIcon, iwBarragemIcon, iwEfluenteIcon, iwPluvialIcon } from '../../../assets/svg/svgs-icons';
import { setInfoMarkerIcon } from '../../../tools';
import { useTheme } from '@mui/material/styles';

const ElemInfoWindow = ({ marker, info, map }) => {

    /**
     * Estado que controla a instância da janela de informações.
     * @type {google.maps.InfoWindow}
     */
    const [infowindow, setInfowindow] = useState();

    /**
     * Estado que controla se a janela de informações está aberta ou fechada.
     * @type {boolean}
     */
    const [isOpen, setIsOpen] = useState(false);

    /**
     * Referência a um elemento para o efeito de hover.
     * @type {React.RefObject}
     */
    const hoverEffectRef = useRef(null);

    /**
     * Estado que controla o elemento div a ser renderizado na janela de informações.
     * @type {HTMLElement}
     */
    const [divElement, setDivElement] = useState(null);

    /**
     * O tema do Material-UI sendo utilizado no componente.
     */
    const theme = useTheme();
    
    useEffect(() => {
        // Cria a instância da janela de informações caso ainda não exista.
        if (!infowindow) {
            let _infowindow = new window.google.maps.InfoWindow({
                content: setContent(theme.palette.primary.main, info),
            });
            // Sobrepor a janela de informações ao popup do polígono, retângulo, etc...
            _infowindow.setZIndex(10);

            // Adiciona um listener para abrir a janela de informações quando o marcador for clicado.
            if (marker) {
                marker.addListener("click", () => {
                    console.log('listener marker click');
                    _infowindow.open({
                        anchor: marker,
                        map: map,
                    });
                });
            }

            setInfowindow(_infowindow);
        }

        // Atualiza a posição da janela de informações ao marcador.
        if (map && marker && infowindow) {
            infowindow.setPosition(marker.position);
        }
    }, [map, marker, infowindow]);

    // Retorna null, pois este componente não possui renderização visível.
    return null;
};

/**
 * Função que gera o conteúdo da janela de informações.
 *
 * @param {string} color - A cor de fundo da janela de informações.
 * @param {object} info - As informações a serem exibidas.
 * @returns {HTMLElement} Retorna o elemento div com o conteúdo da janela de informações.
 */
const setContent = (color, info) => {

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

export default ElemInfoWindow;
