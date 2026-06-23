import { useRef, useEffect } from "react";

const ElemStreetView = ({ streetViewLocation, setStreetViewLocation }) => {
    const ref         = useRef(null);
    const panoramaRef = useRef(null);
    const intervalRef = useRef(null);
    const timeoutRef  = useRef(null);
    const failsafeRef = useRef(null);

    useEffect(() => {
        if (!streetViewLocation || !ref.current) return;

        timeoutRef.current = setTimeout(() => {
            if (!ref.current) return;

            const pano = new window.google.maps.StreetViewPanorama(ref.current, {
                position: streetViewLocation,
                pov: { heading: 0, pitch: 5 },
                zoom: 1,
                addressControl: false,
                linksControl: false,
                panControl: false,
                enableCloseButton: true,
                zoomControl: false,
            });
            panoramaRef.current = pano;

            pano.addListener("closeclick", () => setStreetViewLocation(null));

            pano.addListener("status_changed", () => {
                if (pano.getStatus() !== "OK") setStreetViewLocation(null);
            });

            let tilesLoaded = false;

            failsafeRef.current = setTimeout(() => {
                if (!tilesLoaded) setStreetViewLocation(null);
            }, 4000);

            window.google.maps.event.addListenerOnce(pano, "tiles_loaded", () => {
                tilesLoaded = true;
                clearTimeout(failsafeRef.current);

                let heading = 0;
                intervalRef.current = setInterval(() => {
                    heading += 30;
                    pano.setPov({ heading, pitch: 10 });
                    if (heading >= 360) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                        setStreetViewLocation(null);
                    }
                }, 250);
            });
        }, 50);

        return () => {
            clearTimeout(timeoutRef.current);
            clearTimeout(failsafeRef.current);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (panoramaRef.current) {
                try { panoramaRef.current.setVisible(false); } catch (_) {}
                panoramaRef.current = null;
            }
        };
    }, [streetViewLocation, setStreetViewLocation]);

    return streetViewLocation ? (
        <div ref={ref} style={{ width: "100%", height: "100%" }} />
    ) : null;
};

export default ElemStreetView;
