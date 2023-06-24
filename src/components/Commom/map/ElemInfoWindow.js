import { createRef, useEffect, useState } from 'react';
import { numberWithCommas } from '../../../tools';

const ElemInfoWindow = ({ shape }) => {

    const [infowindow, setInfowindow] = useState();


    useEffect(() => {

        if (!infowindow) {

            setInfowindow(new window.google.maps.InfoWindow(
                { content: setContent(shape) }
            ));

        }

        if (shape.map && shape.position && infowindow) {
            infowindow.setPosition(shape.position);
            infowindow.setMap(shape.map);

        }
    }, [shape.map, shape.position, infowindow])

    return null;
};


const setContent = (shape) => {

    if (shape.type === 'polyline') {
        let coordinates = [];
        let htmlContent = '';

        shape.draw.getPath().forEach((latLng) => {
            coordinates.push({ lat: latLng.lat(), lng: latLng.lng() });
        });
        coordinates.forEach((coordinate, index) => {
            htmlContent += `coordenadas ${index + 1}: ${coordinate.lat}, ${coordinate.lng}<br>`;
        });
        /* conversão: 1000 metros = 1km */

        return `
            <div style="overflow-y: scroll; height: 8rem;  width: 20rem">
                <h3> Polilinha </h3>
                <p><b> ${shape.meters.toFixed(3)} metros </b></p>
                <p><b> ${(shape.meters / 1000).toFixed(3)} quilometros </b></p>
                ${htmlContent}
            </div>
        `
    }
    if (shape.type === 'rectangle') {
        /* conversão: 1.000.000 Metros quadrados = 1 Quilômetros quadrados  */
        return `
        <div style="overflow-y: scroll; height: 8rem; width: 20rem">
            <h3> Retângulo </h3>
            <p><b> area: ${shape.area.toFixed(3)} m² </b></p>
            <p><b> area: ${(shape.area / 1000000).toFixed(3)} km² </b></p>
        </div>
    `
    }
    if (shape.type === 'polygon') {
        /* conversão: 1.000.000 Metros quadrados = 1 Quilômetros quadrados  */
        return `
       <div style="overflow-y: scroll; height: 8rem; width: 20rem">
           <h3> Polígono </h3>
           <p><b> area: ${shape.area.toFixed(3)} m² </b></p>
           <p><b> area: ${(shape.area / 1000000).toFixed(3)} km² </b></p>
       </div>
   `
    }
    if (shape.type === 'circle') {
        /* conversão: 1.000.000 Metros quadrados = 1 Quilômetros quadrados  */

        let formatAream2 = numberWithCommas(shape.area)
        let km2 = shape.area / 1000000
        let formatKm2 = numberWithCommas(km2)
        let formatRadius = numberWithCommas(shape.radius)
        return `
            <div >
                <h3> Informações do Círculo <h3/>
                <div style="font-size: 11px">
                    <p> Area: ${formatAream2} m² = ${(formatKm2)} km²</p>
                    <b> Raio: ${formatRadius} metros</p>
                </div>   
            </div>
`
    }
    return `<div>vazio</div>`
}

export default ElemInfoWindow;