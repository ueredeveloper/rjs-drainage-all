import { useRef, useEffect } from "react";
import { numberWithCommas } from "../../../tools";

/**
 * Converte metros quadrados para hectares.
 * @function
 * @param {number} areaM2 - Área em metros quadrados.
 * @returns {number} Área em hectares.
 */
function convertM2ToHa(areaM2) {
  return areaM2 / 10000;
}

/**
 * Converte metros quadrados para quilômetros quadrados.
 * @function
 * @param {number} areaM2 - Área em metros quadrados.
 * @returns {number} Área em km².
 */
function convertM2ToKm2(areaM2) {
  return areaM2 / 1000000;
}

/**
 * Componente React responsável por criar e exibir um popup customizado (OverlayView) no Google Maps,
 * mostrando informações sobre shapes desenhadas (polígonos, retângulos, círculos, polilinhas).
 *
 * @component
 * @param {Object} props - Propriedades do componente.
 * @param {Object} props.map - Instância do Google Maps.
 * @param {Object} props.position - Posição {lat, lng} para exibir o popup.
 * @param {any} props.content - Conteúdo a ser exibido no popup.
 * @param {Object} props.draw - Objeto com informações do desenho (tipo, área, metros, etc).
 * @param {Function} props.onInfoWindowOpen - Função chamada quando o InfoWindow abrir.
 * @returns {null}
 */
const ElemPopupOverlay = ({
  map,
  position,
  content,
  draw,
  onInfoWindowOpen,
}) => {
  /**
   * Referência para o OverlayView customizado.
   * @type {React.MutableRefObject<any>}
   */
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!map || !position || !content || !draw) return;

    /**
     * Classe interna que estende OverlayView do Google Maps para criar o popup customizado.
     * @class
     */
    class PopupOverlay extends window.google.maps.OverlayView {
      constructor() {
        super();

        // Cria e injeta estilos CSS para o popup
        const styleElement = document.createElement("style");
        document.head.appendChild(styleElement);

        const cssRules = [
          `.popup-bubble {
                position: absolute;
                top: 0;
                left: 0;
                transform: translate(-50%, -100%);
                background-color: white;
                padding: 5px;
                border-radius: 5px;
                font-family: sans-serif;
                overflow-y: auto;
                max-height: 60px;
                box-shadow: 0px 2px 10px 1px rgba(0, 0, 0, 0.5);
            }`,
          `.popup-bubble-anchor {
                position: absolute;
                width: 100%;
                bottom: 8px;
                left: 0;
            }`,
          `.popup-bubble-anchor::after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                transform: translate(-50%, 0);
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 8px solid #000;
            }`,
          `.popup-container {
                cursor: auto;
                height: 0;
                position: absolute;
                width: 200px;
            }`,
        ];

        cssRules.forEach((rule) => styleElement.sheet.insertRule(rule));

        // Cria a estrutura do popup
        const bubbleAnchor = document.createElement("div");
        bubbleAnchor.classList.add("popup-bubble-anchor");
        this.containerDiv = document.createElement("div");
        this.containerDiv.classList.add("popup-container");
        this.containerDiv.appendChild(bubbleAnchor);

        bubbleAnchor.appendChild(setContent(draw));
      }

      /**
       * Adiciona o popup ao mapa.
       */
      onAdd() {
        const panes = this.getPanes();
        panes.floatPane.appendChild(this.containerDiv);
      }

      /**
       * Remove o popup do mapa.
       */
      onRemove() {
        if (this.containerDiv.parentNode) {
          this.containerDiv.parentNode.removeChild(this.containerDiv);
        }
      }

      /**
       * Atualiza a posição do popup conforme o mapa é movido.
       */
      draw() {
        if (!this.containerDiv || !map || !position) return;

        const projection = this.getProjection();
        if (!projection) return;

        const positionLatLng = new window.google.maps.LatLng(
          position.lat,
          position.lng
        );
        const positionPixel = projection.fromLatLngToDivPixel(positionLatLng);

        this.containerDiv.style.left = positionPixel.x + "px";
        this.containerDiv.style.top = positionPixel.y + "px";
      }
    }

    // Instancia e adiciona o Overlay ao mapa
    const popupOverlay = new PopupOverlay();
    popupOverlay.setMap(map);
    overlayRef.current = popupOverlay;

    /**
     * Handler para fechar o popup ao disparar eventos globais.
     */
    const handleInfoWindowOpen = () => {
      popupOverlay.setMap(null);
    };
    window.addEventListener("close-all-infowindows", handleInfoWindowOpen);
    window.addEventListener("infowindow-open", handleInfoWindowOpen);

    return () => {
      popupOverlay.setMap(null);
      window.removeEventListener("close-all-infowindows", handleInfoWindowOpen);
      window.removeEventListener("infowindow-open", handleInfoWindowOpen);
    };
  }, [map, position, content, draw, onInfoWindowOpen]);

  useEffect(() => {
    if (!overlayRef.current || !content) return;
    const containerDiv = overlayRef.current.containerDiv;
    containerDiv.style.display = "block";
  }, [content]);

  return null;
};

/**
 * Gera o conteúdo do popup com base no tipo de shape desenhado.
 * Cria elementos HTML customizados para cada tipo de desenho (polilinha, retângulo, polígono, círculo).
 *
 * @param {Object} draw - Objeto com informações do desenho (tipo, área, metros, etc).
 * @returns {HTMLElement|string} Elemento HTML com o conteúdo do popup ou string vazia.
 */
const setContent = (draw) => {
  // Cria e injeta estilos para o conteúdo do overlay
  const thumbStyle = document.createElement("style");
  thumbStyle.innerHTML = `
        .overlay-info {
            display: flex;
            flex-direction: column;
            text-align: center;
            overflow-y: scroll;
            font-size: 12px;
            width: 17rem;
            min-height: 5rem;
            background-color: #000;
            color: #fff;
            opacity: 0.8;
        }
        .overlay-info::-webkit-scrollbar {
            width: 10px;
        }
        .overlay-info::-webkit-scrollbar-thumb {
            background: red;
        }
    `;
  document.head.appendChild(thumbStyle);

  /**
   * Cria o elemento HTML principal do popup.
   * @param {string} type - Tipo do shape.
   * @param {string} content - Texto com as informações do shape.
   * @returns {HTMLElement} Elemento HTML do popup.
   */
  function createContentDiv(type, content) {
    const divElement = document.createElement("div");
    divElement.classList.add("popup-bubble");

    const h3Element = document.createElement("h4");
    h3Element.textContent = `Informações do ${type}`;
    const innerDivElement = document.createElement("div");
    const bElement = document.createElement("b");
    bElement.textContent = content;

    innerDivElement.appendChild(bElement);
    divElement.appendChild(h3Element);
    divElement.appendChild(innerDivElement);
    divElement.classList.add("overlay-info");

    return divElement;
  }

  // Polilinha
  if (draw.type === "polyline") {
    let coordinates = [];
    let htmlCoords = "";

    draw.draw.getPath().forEach((latLng) => {
      coordinates.push({ lat: latLng.lat(), lng: latLng.lng() });
    });

    coordinates.forEach((coordinate, index) => {
      htmlCoords += `${index + 1}: ${coordinate.lat}, ${coordinate.lng}`;
    });

    let meters = draw.meters.toFixed(3);
    let formatMeters = numberWithCommas(meters);
    let km = draw.meters / 1000;
    let formatKm = numberWithCommas(km);

    let content = `${formatMeters} metros / ${formatKm} km.`;
    let type = `Polilinha`;
    return createContentDiv(type, content);
  }

  // Retângulo
  if (draw.type === "rectangle") {
    let areaM2 = draw.area.toFixed(2);
    let formatAreaM2 = numberWithCommas(areaM2);
    let areaHa = convertM2ToHa(draw.area);
    let formatAreaHa = numberWithCommas(areaHa.toFixed(2));
    let areaKm2 = convertM2ToKm2(draw.area);
    let formatAreaKm2 = numberWithCommas(areaKm2.toFixed(5));

    let content = `Área: ${formatAreaM2} m² / ${formatAreaHa} ha / ${formatAreaKm2} km²`;
    let type = `Retângulo`;
    return createContentDiv(type, content);
  }

  // Polígono
  if (draw.type === "polygon") {
    let areaM2 = draw.area.toFixed(2);
    let formatAreaM2 = numberWithCommas(areaM2);
    let areaHa = convertM2ToHa(draw.area);
    let formatAreaHa = numberWithCommas(areaHa.toFixed(2));
    let areaKm2 = convertM2ToKm2(draw.area);
    let formatAreaKm2 = numberWithCommas(areaKm2.toFixed(5));

    let content = `Área: ${formatAreaM2} m² / ${formatAreaHa} ha / ${formatAreaKm2} km²`;
    let type = `Polígono`;
    return createContentDiv(type, content);
  }

  // Círculo
  if (draw.type === "circle") {
    let formatAreaM2 = numberWithCommas(draw.area);
    let areaHa = convertM2ToHa(draw.area);
    let formatAreaHa = numberWithCommas(areaHa.toFixed(2));
    let areaKm2 = convertM2ToKm2(draw.area);
    let formatAreaKm2 = numberWithCommas(areaKm2.toFixed(5));
    let formatRadius = numberWithCommas(draw.radius);

    let content = `Área: ${formatAreaM2} m² / ${formatAreaHa} ha / ${formatAreaKm2} km² / Raio: ${formatRadius} metros`;
    let type = `Círculo`;
    return createContentDiv(type, content);
  }

  // Caso não reconheça o tipo
  return `<div></div>`;
};

export default ElemPopupOverlay;
