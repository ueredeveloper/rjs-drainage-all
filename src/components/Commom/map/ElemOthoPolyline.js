import { useEffect, useState } from 'react';


/**
 * Elemento de Polilinha para as shapes Hidrogeo_Fraturado e Hidrogeo_Poroso.
 * @component
 * @param {*} param0 
 */
const ElemOttoPolyline = ({ attributes, geometry, map }) => {
    

    const [polyline, setPolyline] = useState();

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

    if (polyline) {
        polyline.setOptions(
            {
                path: geometry.rings[0][0],
                geodesic: true,
                strokeColor: "#0000FF",
                strokeWeight: 3,
                map,
            }
        );
    }

    return null;

};

export default ElemOttoPolyline;