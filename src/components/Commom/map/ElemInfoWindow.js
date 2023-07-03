import { createRef, useEffect, useRef, useState } from 'react';
import { numberWithCommas } from '../../../tools';

const ElemInfoWindow = ({ draw }) => {

    const [infowindow, setInfowindow] = useState();
    const [isOpen, setIsOpen] = useState(false);
    const hoverEffectRef = useRef(null);
    const [divElement, setDivElement] = useState(null);


    useEffect(() => {

        if (!infowindow) {

            let _infowindow = new window.google.maps.InfoWindow({
                content: setContent(draw)
            })
          
            setInfowindow(_infowindow);
        }


        if (draw.map && draw.position && infowindow) {
            //infowindow.setMap(null)
            console.log('hhh')
            infowindow.setPosition(draw.position);
            infowindow.setMap(draw.map);

            window.google.maps.event.addListener(infowindow, 'domready', function() {
                console.log('ready')
            });
            

            const handleCloseClick = () => {
                //gm-ui-hover-effect
                //setIsOpen(false);
                //console.log('window listener on close click')
                // Handle focus manually.

                window.document.querySelectorAll('.gm-ui-hover-effect').forEach((el) => el.addEventListener("closeclick", function () {
                    console.log("clicked item inside infowindow")
                }));
            };

            //infowindow.addListener('closeclick', handleCloseClick);
            window.google.maps.event.addListener(infowindow, 'domready', handleCloseClick);

        }

        
    }, [draw.map, draw.position, draw.radius, infowindow])

  

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
        return `
            <div style="overflow-y: scroll; height: 4rem; width: 20rem">
                <h3> Informações do Retângulo </h3>
                <div style="font-size: 12px">
                    <b> Área: ${formatAreaM2} m² = ${formatAreaKm2} km² </b>
                </div>
            </div>
        `
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

export default ElemInfoWindow;