import { useEffect, useState } from 'react';


/**
 * Elemento de Polilinha para as shapes Hidrogeo_Fraturado e Hidrogeo_Poroso.
 * @component
 * @param {*} param0 
 */
const ElemOttoPolyline = ({ geometry, map, zoom }) => {

    console.log(zoom)

    const [polyline, setPolyline] = useState();
    // Para controlar a largura da linha de acordo com o zoom
    const [strokeWeight, setStrokeWeight] = useState(1.5);

    useEffect(() => {

        // Listener para capturar o zoom e mudar a largura da linha
        /*let zoomListener = map.addListener('zoom_changed', () => {
            // captura o zom
            const zoom = map.getZoom();

            // Se o usuário aproximar mais o mapa, a linha cresce a largura de aocrdo com o zoom
            const newWeight = zoom <= 12 ? 1.5 : 4;
            setStrokeWeight(newWeight);
        });*/

        if (!polyline) {
            setPolyline(new window.google.maps.Polyline());
        }
        // remove marker from map on unmount
        return () => {
            if (polyline) {
                polyline.setMap(null);

            }
            //window.google.maps.event.removeListener(zoomListener);
        };
    }, [polyline, setPolyline]);

    useEffect(() => {

        console.log(zoom)

        // Se o usuário aproximar mais o mapa, a linha cresce a largura de aocrdo com o zoom
        const newWeight = zoom <= 12 ? 1.5 : 4;
        setStrokeWeight(newWeight);

    }, [zoom])


    if (polyline) {

        polyline.setOptions(
            {
                path: geometry.rings[0][0],
                geodesic: true,
                strokeColor: "#0000FF",
                strokeWeight: strokeWeight,
                map,
            }
        );


    }

    return null;

};

export default ElemOttoPolyline;