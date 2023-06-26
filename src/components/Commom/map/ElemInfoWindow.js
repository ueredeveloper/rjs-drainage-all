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
            infowindow.setMap(null)
            infowindow.setPosition(shape.position);
            infowindow.setMap(shape.map);

        }
    }, [shape.map, shape.position, shape.radius, infowindow])

    return null;
};


const setContent = (shape) => {

    if (shape.type === 'polyline') {
        let coordinates = [];
        let htmlCoords = '';

        shape.draw.getPath().forEach((latLng) => {
            coordinates.push({ lat: latLng.lat(), lng: latLng.lng() });
        });
        coordinates.forEach((coordinate, index) => {
            htmlCoords += `${index + 1}: ${coordinate.lat}, ${coordinate.lng}<br>`;
        });
        /* conversão: 1000 metros = 1km */
        let meters = shape.meters.toFixed(3);
        let formatMeters = numberWithCommas(meters)
        let km = shape.meters / 1000;
        let formatKm = numberWithCommas(km)

        return `
            <div style="overflow-y: scroll; padding: 0px; height: 4rem;  width: 20rem">
                <h3> Polilinha </h3>
                <div style="font-size: 12px">
                    <b> ${formatMeters} metros = ${formatKm} km </b>
                <br/>
                ${htmlCoords}
                </div>
            </div>
        `
    }
    if (shape.type === 'rectangle') {
        /* conversão: 1.000.000 Metros quadrados = 1 Quilômetros quadrados  */

        let areaM2 = shape.area.toFixed(2)
        let formatAreaM2 = numberWithCommas(areaM2)
        let areakKm2 = shape.area / 1000000
        let formatAreaKm2 = numberWithCommas(areakKm2)
        return `
            <div style="overflow-y: scroll; height: 4rem; width: 20rem">
                <h3> Retângulo </h3>
                <div style="font-size: 12px">
                    <b> Área: ${formatAreaM2} m² = ${formatAreaKm2} km² </b>
                </div>
            </div>
        `
    }
    if (shape.type === 'polygon') {
        /* conversão: 1.000.000 Metros quadrados = 1 Quilômetros quadrados  */
        let areaM2 = shape.area.toFixed(2)
        let formatAreaM2 = numberWithCommas(areaM2)
        let areakKm2 = shape.area / 1000000
        let formatAreaKm2 = numberWithCommas(areakKm2)
        return `
            <div style="overflow-y: scroll; height: 4rem; width: 20rem">
                <h3> Polígono </h3>
                <div style="font-size: 12px">
                    <b> Área: ${formatAreaM2} m² = ${formatAreaKm2} km² </b>
                </div>
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
                <div style="font-size: 12px">
                    <p> Área: ${formatAream2} m² = ${(formatKm2)} km²</p>
                    <b> Raio: ${formatRadius} metros</p>
                </div>   
            </div>
        `
    }
    return `<div></div>`
}

export default ElemInfoWindow;