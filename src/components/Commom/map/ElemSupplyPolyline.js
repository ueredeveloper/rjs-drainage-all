import { useEffect, useState } from "react";
import ElemPolylineInfoWindow from "./infowindow/ElemPolylineInfoWindow";

/**
 * Elemento de Polilinha para as shapes Hidrogeo_Fraturado e Hidrogeo_Poroso.
 * @component
 * @param {*} param0
 */
const ElemSupplyPolyline = ({ shape, map, zoom, index }) => {

    const [polyline, setPolyline] = useState();
    // Para controlar a largura da linha de acordo com o zoom
    const [strokeWeight, setStrokeWeight] = useState(1.5);

    const [strokeColor] = useState(
        "#" + Math.floor(Math.random() * 16777215).toString(16),
    );

    useEffect(() => {

        if (!polyline) {
            setPolyline(new window.google.maps.Polyline());
        }
        // remove marker from map on unmount
        return () => {
            if (polyline) {
                polyline.setMap(null);
            }
        };
    }, [polyline, setPolyline]);

    useEffect(() => {

        let newWeight;
        if (zoom <= 10) {
            newWeight = 1;
        } else if (zoom <= 12) {
            newWeight = 2;
        } else if (zoom <= 15) {
            newWeight = 4;
        } else if (zoom <= 17) {
            newWeight = 6;
        } else {
            newWeight = 8;
        }

        setStrokeWeight(newWeight);

    }, [zoom])

    if (polyline) {

        const polylineIcon = {
            path: `M100.577,223.936c14.221,0,25.754,11.533,25.754,25.754
            s-11.533,25.754-25.754,25.754c-14.221,0-25.754-11.533-25.754-25.754S86.356,223.936,100.577,223.936L100.577,223.936z
            M103.605,179.88c39.309,0,71.157,31.848,71.157,71.157c0,6.335-0.833,12.474-2.386,18.32c0.017-0.551,0.028-1.101,0.028-1.656
            c0-29.758-24.109-53.867-53.867-53.867c-7.695,0-15.01,1.616-21.631,4.524l-0.001-0.003c-8.681,3.609-18.896,0.294-23.7-8.069
            c-5.22-9.087-2.086-20.679,6.996-25.892C86.888,180.548,95.966,179.88,103.605,179.88L103.605,179.88z M38.549,281.614
            c-19.655-34.043-7.998-77.547,26.045-97.202c5.487-3.168,11.219-5.516,17.059-7.093c-0.485,0.261-0.968,0.527-1.448,0.804
            c-25.771,14.879-34.596,47.812-19.717,73.584c3.848,6.664,8.905,12.191,14.733,16.471l-0.002,0.002
            c7.466,5.713,9.702,16.217,4.862,24.559c-5.259,9.064-16.866,12.146-25.921,6.887C47.487,295.757,42.369,288.23,38.549,281.614
            L38.549,281.614z M159.182,287.086c-19.655,34.043-63.159,45.7-97.202,26.045c-5.487-3.168-10.386-6.958-14.672-11.227
            c0.468,0.29,0.94,0.575,1.42,0.852c25.771,14.879,58.705,6.055,73.584-19.717c3.847-6.664,6.105-13.807,6.898-20.995l0.003,0.001
            c1.215-9.323,9.194-16.511,18.838-16.49c10.479,0.023,18.951,8.533,18.925,19.005C166.961,272.275,163.001,280.471,159.182,287.086
            L159.182,287.086z`,
            fillColor: 'blue',
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: 'white',
            scale: 0.12,
        };

        polyline.setOptions({
            path: shape.geometry?.coordinates[0],
            geodesic: true,
            strokeColor: " #134FAF",
            strokeOpacity: 1,
            strokeWeight: 3,
            map: map,
        });

        // Adicionar ícone em apenas algumas polylinhas, não em todas, para não sujar o mapa com ícones em excesso
        // Adicionar ícone de 5 em 5 polilinhas
        if (index % 5 === 4) {
            polyline.setOptions({
                icons: [{
                    icon: polylineIcon,
                    offset: '100%' // posição do ícone no meio da linha
                }]
            })
        }
    }

    // Se houver infowindow
    /*return polyline ? (
         <ElemPolylineInfoWindow polyline={polyline} shape={shape} map={map} />
     ) : null;*/
    return null;
};

export default ElemSupplyPolyline;
