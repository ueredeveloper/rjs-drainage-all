import { useRef, useEffect } from 'react';
import { numberWithCommas } from '../../../tools';

/**
 * Elemento de renderização de um popup com informações de polígonos, retângulos etc.
 * Cria um OverlayView customizado do Google Maps para exibir informações sobre shapes desenhadas.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.map - Instância do Google Maps.
 * @param {Object} props.position - Posição {lat, lng} para exibir o popup.
 * @param {any} props.content - Conteúdo a ser exibido no popup.
 * @param {Object} props.draw - Objeto com informações do desenho (tipo, área, metros, etc).
 * @param {Function} props.onInfoWindowOpen - Função a ser chamada quando o InfoWindow abrir.
 * @returns {null}
 */
const ElemPopupOverlay = ({ map, position, content, draw, onInfoWindowOpen }) => {
    const overlayRef = useRef(null);

    useEffect(() => {
        if (!map || !position || !content || !draw) return;

        /**
         * Classe customizada para OverlayView do Google Maps.
         * Responsável por criar e gerenciar o popup customizado.
         * @class
         * @extends window.google.maps.OverlayView
         */
        class PopupOverlay extends window.google.maps.OverlayView {
            constructor() {
                super();

                // Cria e adiciona estilos CSS para o popup
                const styleElement = document.createElement('style');
                document.head.appendChild(styleElement);
                const cssRule1 = `
                    .popup-bubble {
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
                    }`;
                const cssRule2 = `
                    .popup-bubble-anchor {  
                        position: absolute;
                        width: 100%;
                        bottom: 8px;
                        left: 0;
                    }`;
                const cssRule3 = `
                    .popup-bubble-anchor::after {
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
                    }`;
                const cssRule4 = `
                    .popup-container {
                        cursor: auto;
                        height: 0;
                        position: absolute;
                        width: 200px;
                    }`;

                // Insere as regras de estilo no documento
                styleElement.sheet.insertRule(cssRule1);
                styleElement.sheet.insertRule(cssRule2);
                styleElement.sheet.insertRule(cssRule3);
                styleElement.sheet.insertRule(cssRule4);

                // Cria elementos do DOM para o popup
                const bubbleAnchor = document.createElement("div");
                bubbleAnchor.classList.add("popup-bubble-anchor");
                this.containerDiv = document.createElement("div");
                this.containerDiv.classList.add("popup-container");
                this.containerDiv.appendChild(bubbleAnchor);

                // Adiciona o conteúdo customizado ao popup
                bubbleAnchor.appendChild(setContent(draw));
            }

            /**
             * Adiciona o overlay ao mapa.
             * @override
             */
            onAdd() {
                const panes = this.getPanes();
                panes.floatPane.appendChild(this.containerDiv);
            }

            /**
             * Remove o overlay do mapa.
             * @override
             */
            onRemove() {
                if (this.containerDiv.parentNode) {
                    this.containerDiv.parentNode.removeChild(this.containerDiv);
                }
            }

            /**
             * Atualiza a posição do overlay conforme o mapa é movido.
             * @override
             */
            draw() {
                if (!this.containerDiv || !map || !position) return;

                const projection = this.getProjection();
                if (!projection) return;

                const positionLatLng = new window.google.maps.LatLng(position.lat, position.lng);
                const positionPixel = projection.fromLatLngToDivPixel(positionLatLng);

                this.containerDiv.style.left = positionPixel.x + 'px';
                this.containerDiv.style.top = positionPixel.y + 'px';
            }
        }

        // Cria e adiciona o overlay ao mapa
        const popupOverlay = new PopupOverlay();
        popupOverlay.setMap(map);
        overlayRef.current = popupOverlay;

        // Listener para ocultar o overlay quando o InfoWindow abrir
        const handleInfoWindowOpen = () => {
            popupOverlay.setMap(null);
        };
        window.addEventListener('close-all-infowindows', handleInfoWindowOpen);
        window.addEventListener('infowindow-open', handleInfoWindowOpen);

        return () => {
            popupOverlay.setMap(null);
            window.removeEventListener('close-all-infowindows', handleInfoWindowOpen);
            window.removeEventListener('infowindow-open', handleInfoWindowOpen);
        };

    }, [map, position, content, draw, onInfoWindowOpen]);

    useEffect(() => {
        // Garante que o overlay está criado e atualiza a exibição do conteúdo
        if (!overlayRef.current || !content) return;

        const containerDiv = overlayRef.current.containerDiv;
        containerDiv.style.display = 'block';
    }, [content]);

    return null;
};

/**
 * Função auxiliar para criar o conteúdo do popup conforme o tipo de shape desenhado.
 * Retorna um elemento HTML com informações formatadas.
 *
 * @param {Object} draw - Objeto com informações do desenho (tipo, área, metros, etc).
 * @returns {HTMLElement|string} Elemento HTML com o conteúdo do popup ou string vazia.
 */
const setContent = (draw) => {
    // Adiciona estilos customizados para o conteúdo do overlay
    const thumbStyle = document.createElement('style');
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
     * Cria o elemento de conteúdo do popup.
     * @param {string} type - Tipo do shape desenhado.
     * @param {string} content - Texto a ser exibido.
     * @returns {HTMLElement}
     */
    function createContentDiv(type, content) {
        const divElement = document.createElement('div');
        divElement.classList.add("popup-bubble");

        const h3Element = document.createElement('h4');
        h3Element.textContent = `Informações do ${type}`;
        const innerDivElement = document.createElement('div');
        const bElement = document.createElement('b');
        bElement.textContent = content;

        innerDivElement.appendChild(bElement);
        divElement.appendChild(h3Element);
        divElement.appendChild(innerDivElement);
        divElement.classList.add('overlay-info');

        return divElement;
    }

    // Monta o conteúdo conforme o tipo de shape desenhado
    if (draw.type === 'polyline') {
        let coordinates = [];
        let htmlCoords = '';

        draw.draw.getPath().forEach((latLng) => {
            coordinates.push({ lat: latLng.lat(), lng: latLng.lng() });
        });

        coordinates.forEach((coordinate, index) => {
            htmlCoords += `${index + 1}: ${coordinate.lat}, ${coordinate.lng}<br>`;
        });
        // conversão: 1000 metros = 1km
        let meters = draw.meters.toFixed(3);
        let formatMeters = numberWithCommas(meters)
        let km = draw.meters / 1000;
        let formatKm = numberWithCommas(km)

        let content = `${formatMeters} metros = ${formatKm} km.`
        let type = `Polilinha`;
        return createContentDiv(type, content);
    }
    if (draw.type === 'rectangle') {
        // conversão: 1.000.000 Metros quadrados = 1 Quilômetros quadrados
        let areaM2 = draw.area.toFixed(2)
        let formatAreaM2 = numberWithCommas(areaM2)
        let areakKm2 = draw.area / 1000000
        let formatAreaKm2 = numberWithCommas(areakKm2)

        let content = `Área: ${formatAreaM2} m² = ${formatAreaKm2} km²`;
        let type = `Retângulo`;
        return createContentDiv(type, content);

    }
    if (draw.type === 'polygon') {
        // conversão: 1.000.000 Metros quadrados = 1 Quilômetros quadrados
        let areaM2 = draw.area.toFixed(2)
        let formatAreaM2 = numberWithCommas(areaM2)
        let areakKm2 = draw.area / 1000000
        let formatAreaKm2 = numberWithCommas(areakKm2)

        let content = `Área: ${formatAreaM2} m² = ${formatAreaKm2} km²`;
        let type = `Polígono`;
        return createContentDiv(type, content);
    }
    if (draw.type === 'circle') {
        // conversão: 1.000.000 Metros quadrados = 1 Quilômetros quadrados
        let formatAreaM2 = numberWithCommas(draw.area)
        let km2 = draw.area / 1000000
        let formatAreaKm2 = numberWithCommas(km2)
        let formatRadius = numberWithCommas(draw.radius)

        let content = `Área: ${formatAreaM2} m² = ${formatAreaKm2} km², Raio: ${formatRadius} metros`;
        let type = `Círculo`;
        return createContentDiv(type, content);
    }

    // Caso não seja nenhum dos tipos acima, retorna um div vazio
    return `<div></div>`
}

export default ElemPopupOverlay;
