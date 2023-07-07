import { createRef, useEffect, useRef, useState } from 'react';
import { iwManualIcon, iwTubularIcon, iwSuperficialIcon, iwBarragemIcon, iwEfluenteIcon, iwPluvialIcon } from '../../../assets/svg/svgs-icons';
import { setInfoMarkerIcon } from '../../../tools';
import { useTheme } from '@mui/material/styles';

const ElemInfoWindow = ({ marker, info, map }) => {

    const [infowindow, setInfowindow] = useState();
    const [isOpen, setIsOpen] = useState(false);
    const hoverEffectRef = useRef(null);
    const [divElement, setDivElement] = useState(null);

    const theme = useTheme();
    
    useEffect(() => {

        if (!infowindow) {

            let _infowindow = new window.google.maps.InfoWindow({
                content: setContent(theme.palette.primary.main, info),
                
            });
            // sobrepor infowindow ao popup do polígono, retângulo etc...
            _infowindow.setZIndex(10);


            if (marker) {
                marker.addListener("click", () => {
                    console.log('listener marker click')
                    _infowindow.open({
                        anchor: marker,
                        map: map,
                    });
                });
            }

            setInfowindow(_infowindow);
        }


        if (map && marker && infowindow) {

            infowindow.setPosition(marker.position);
        }


    }, [map, marker, infowindow])

    return null;
};



const setContent = (color, info) => {

    let svgData = setInfoMarkerIcon(info.id, info.ti_id, info.tp_id).iw;

    // Create an object element

    const image = document.createElement('object');
    image.setAttribute('type', 'image/svg+xml');
    image.setAttribute('data', `data:image/svg+xml,${encodeURIComponent(svgData)}`);

    image.style.width = '70px';
    image.style.height = '70px';


    // Create the container div
    const containerDiv = document.createElement('div');
    containerDiv.id = 'wi-container';

    // Create the title div
    const titleDiv = document.createElement('div');
    titleDiv.id = 'wi-title';

    const tittleType = document.createElement('div');
    tittleType.textContent = info.ti_descricao;
    const wellType = document.createElement('div');
    wellType.textContent = info.tp_descricao;
    titleDiv.appendChild(tittleType);
    titleDiv.appendChild(wellType);

    // Create a <style> element
    const styleElement = document.createElement('style');

    // Set the CSS styles

    const setStyles = (bgColor) => {
        return `
          #wi-container {
                width: 400px;
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

    // Append the <style> element to the <head> of the document
    document.head.appendChild(styleElement);

    const overlflowDiv = document.createElement('div');
    overlflowDiv.id = 'wi-overflow';

    // Create the subtitle div
    const subtitleDiv = document.createElement('div');
    subtitleDiv.id = 'wi-subtitle';

    // Create the first inner div of the subtitle
    const infoDiv = document.createElement('div');
    infoDiv.textContent = 'Informações';

    // Append the inner divs to the subtitle div
    subtitleDiv.appendChild(infoDiv);
    subtitleDiv.appendChild(image);



    // Create the info div
    const infoContentDiv = document.createElement('div');
    infoContentDiv.id = 'wi-info'
    const infoTextDiv = document.createElement('div');

    // Create the <p> elements for each property and set their text content
    const nomeElement = document.createElement('p');
    nomeElement.textContent = `Nome: ${info.us_nome}`;

    const cpfElement = document.createElement('p');
    cpfElement.textContent = `CPF: ${info.us_cpf_cnpj}`;

    const enderecoElement = document.createElement('p');
    enderecoElement.textContent = `Endereço: ${info.emp_endereco}`;

    const processoElement = document.createElement('p');
    processoElement.textContent = `Processo: ${info.int_processo}`;

    const coordenadasElement = document.createElement('p');
    coordenadasElement.textContent = `Coordenadas: ${info.int_latitude}, ${info.int_longitude}`;

    infoTextDiv.appendChild(nomeElement);
    infoTextDiv.appendChild(cpfElement);
    infoTextDiv.appendChild(enderecoElement);
    infoTextDiv.appendChild(processoElement);
    infoTextDiv.appendChild(coordenadasElement);

    infoContentDiv.appendChild(infoTextDiv);

    // Append all the elements to the container div
    containerDiv.appendChild(titleDiv);
    overlflowDiv.appendChild(subtitleDiv);
    overlflowDiv.appendChild(infoContentDiv);

    containerDiv.appendChild(overlflowDiv);



    return containerDiv;
}

export default ElemInfoWindow;