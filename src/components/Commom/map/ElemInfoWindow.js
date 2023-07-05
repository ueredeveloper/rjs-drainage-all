import { createRef, useEffect, useRef, useState } from 'react';
import { numberWithCommas } from '../../../tools';

const ElemInfoWindow = ({ marker, map }) => {

    const [infowindow, setInfowindow] = useState();
    const [isOpen, setIsOpen] = useState(false);
    const hoverEffectRef = useRef(null);
    const [divElement, setDivElement] = useState(null);


    useEffect(() => {

        if (!infowindow) {

            let _infowindow = new window.google.maps.InfoWindow({
                content: setContent(marker)
            });

            /*
            if (marker.marker) {
                marker.marker.addListener("click", () => {
                    _infowindow.open({
                        anchor: marker.marker,
                        // map:props.map,
                    });
                });
            }*/
            setInfowindow(_infowindow);
        }


        if (marker.map && marker.position && infowindow) {
            //infowindow.setMap(null)
            console.log('hhh')
            infowindow.setPosition(marker.position);
            infowindow.setMap(marker.map);

            window.google.maps.event.addListener(infowindow, 'domready', function () {
                console.log('ready')
            });

        }


    }, [marker.map, marker.position, marker.radius, infowindow])



    return null;
};


const setContent = (marker) => {

    if (marker.type === 'marker') {

        return `
            <div >
                <h3> Informações do Marcador <h3/>
                <div style="font-size: 12px">
                    <p> Coordenadas: ${marker.int_latitude}, ${marker.int_longitude}</p>
                    
                </div>   
            </div>
        `
    }
    return `<div></div>`
}

export default ElemInfoWindow;