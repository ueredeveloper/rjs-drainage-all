import { useRef, useEffect } from "react";

const ElemStreetView = ({ streetViewLocation, setStreetViewLocation }) => {
    const ref = useRef(null);
    const panoramaRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!streetViewLocation || !ref.current) return;

        // Inicializa o Street View
        panoramaRef.current = new window.google.maps.StreetViewPanorama(ref.current, {
            position: streetViewLocation,
            pov: { heading: 165, pitch: 0 },
            zoom: 0,
            addressControl: false,
            linksControl: true,
            panControl: true,
            enableCloseButton: true,
        });

        let heading = 0;

        intervalRef.current = setInterval(() => {
            heading += 10;
            panoramaRef.current?.setPov({
                heading,
                pitch: 10
            });

            if (heading > 360) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                setStreetViewLocation(null);
            }
        }, 100);

        // Cleanup no desmontar ou quando streetViewLocation mudar
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            panoramaRef.current = null;
        };
    }, [streetViewLocation, setStreetViewLocation]);

    return streetViewLocation ? (
        <div ref={ref} style={{ width: "100%", height: "100%", minHeight: "25rem" }} />
    ) : null;
};

export default ElemStreetView;
