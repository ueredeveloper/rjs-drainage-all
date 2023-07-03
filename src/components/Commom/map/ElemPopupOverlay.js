import React, { useRef, useEffect } from 'react';
import { numberWithCommas } from '../../../tools';

const GMapsOverlayView = ({ map, position, content, draw }) => {
    const overlayRef = useRef(null);

    useEffect(() => {
        if (!map || !position || !content) return;

        class PopupOverlay extends window.google.maps.OverlayView {
            constructor() {
                super();
                content = document.createElement('div');
                content.style.className = 'content';
                content.innerHTML = 'Hello'

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
                        border-top: 8px solid white;
                    }`;
                const cssRule4 = `
                        .popup-container {
                        cursor: auto;
                        height: 0;
                        position: absolute;
                        width: 200px;
                    }`;

                styleElement.sheet.insertRule(cssRule1);
                styleElement.sheet.insertRule(cssRule2);
                styleElement.sheet.insertRule(cssRule3);
                styleElement.sheet.insertRule(cssRule4);
                content.innerHTML = 'Hello'
                content.classList.add("popup-bubble");

                // This zero-height div is positioned at the bottom of the bubble.
                const bubbleAnchor = document.createElement("div");

                bubbleAnchor.classList.add("popup-bubble-anchor");
                bubbleAnchor.appendChild(content);
                // This zero-height div is positioned at the bottom of the tip.
                this.containerDiv = document.createElement("div");
                this.containerDiv.classList.add("popup-container");
                this.containerDiv.appendChild(bubbleAnchor);

                bubbleAnchor.appendChild(content);

                this.containerDiv = document.createElement("div");
                this.containerDiv.classList.add("popup-container");
                this.containerDiv.appendChild(bubbleAnchor);

            }

            onAdd() {
                const panes = this.getPanes();
                panes.floatPane.appendChild(this.containerDiv);
            }

            onRemove() {
                this.containerDiv.parentNode.removeChild(this.containerDiv);
            }

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

        const popupOverlay = new PopupOverlay();
        popupOverlay.setMap(map);

        overlayRef.current = popupOverlay;

        return () => {
            popupOverlay.setMap(null);
        };
    }, [map, position, content]);

    useEffect(() => {
        if (!overlayRef.current || !content) return;

        const containerDiv = overlayRef.current.containerDiv;

        containerDiv.style.display = 'block';
    }, [content]);

    return null;
};


const setContent = (draw) => {

    if (draw.type === 'polyline') {
        let coordinates = [];
        let htmlCoords = '';

        draw.draw.getPath().forEach((latLng) => {
            coordinates.push({ lat: latLng.lat(), lng: latLng.lng() });
        });
        coordinates.forEach((coordinate, index) => {
            htmlCoords += `${index + 1}: ${coordinate.lat}, ${coordinate.lng}<br>`;
        });
        /* conversão: 1000 metros = 1km */
        let meters = draw.meters.toFixed(3);
        let formatMeters = numberWithCommas(meters)
        let km = draw.meters / 1000;
        let formatKm = numberWithCommas(km)

        return `
            <div style="overflow-y: scroll; padding: 0px; height: 4rem;  width: 20rem">
                <h3> Informações da Polilinha </h3>
                <div style="font-size: 12px">
                    <b> ${formatMeters} metros = ${formatKm} km </b>
                <br/>
                ${htmlCoords}
                </div>
            </div>
        `
    }
    if (draw.type === 'rectangle') {
        /* conversão: 1.000.000 Metros quadrados = 1 Quilômetros quadrados  */

        let areaM2 = draw.area.toFixed(2)
        let formatAreaM2 = numberWithCommas(areaM2)
        let areakKm2 = draw.area / 1000000
        let formatAreaKm2 = numberWithCommas(areakKm2)

        const divElement = document.createElement('div');
        //divElement.setAttribute('id', 'content')
        divElement.classList.add("popup-bubble");
        divElement.style.overflowY = 'scroll';
        divElement.style.height = '4rem';
        divElement.style.width = '20rem';

        const h3Element = document.createElement('h3');
        h3Element.textContent = 'Informações do Retângulo';

        const innerDivElement = document.createElement('div');
        innerDivElement.style.fontSize = '12px';

        const bElement = document.createElement('b');
        bElement.textContent = `Área: ${formatAreaM2} m² = ${formatAreaKm2} km²`;

        innerDivElement.appendChild(bElement);
        divElement.appendChild(h3Element);
        divElement.appendChild(innerDivElement);

        return divElement;

    }
    if (draw.type === 'polygon') {
        /* conversão: 1.000.000 Metros quadrados = 1 Quilômetros quadrados  */
        console.log('polygon', draw.position)
        let areaM2 = draw.area.toFixed(2)
        let formatAreaM2 = numberWithCommas(areaM2)
        let areakKm2 = draw.area / 1000000
        let formatAreaKm2 = numberWithCommas(areakKm2)
        return `
            <div style="overflow-y: scroll; height: 4rem; width: 20rem">
                <h3> Informações do Polígono </h3>
                <div style="font-size: 12px">
                    <b> Área: ${formatAreaM2} m² = ${formatAreaKm2} km² </b>
                </div>
            </div>
        `
    }
    if (draw.type === 'circle') {
        /* conversão: 1.000.000 Metros quadrados = 1 Quilômetros quadrados  */

        let formatAream2 = numberWithCommas(draw.area)
        let km2 = draw.area / 1000000
        let formatKm2 = numberWithCommas(km2)
        let formatRadius = numberWithCommas(draw.radius)
        return `
            <div >
                <h3> Informações do Círculo <h3/>
                <div style="font-size: 12px">
                    <p> Área: ${formatAream2} m² = ${(formatKm2)} km²</p>
                    <b> Raio: ${formatRadius} metros</p>
                </div>   
            </div>
        `
    }

    if (draw.type === 'marker') {

        return `
            <div >
                <h3> Informações do Marcador <h3/>
                <div style="font-size: 12px">
                    <p> Coordenadas: ${draw.int_latitude}, ${draw.int_longitude}</p>
                    
                </div>   
            </div>
        `
    }
    return `<div></div>`
}


export default GMapsOverlayView;
