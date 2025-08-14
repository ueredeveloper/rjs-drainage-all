import { useRef, useEffect, useState } from "react";

const ElemStreeView = ({ location, onClose }) => {

    const streetViewRef = useRef(null);
    const animationRef = useRef(null);


    console.log('Elem StreetView')
    useEffect(() => {
        if (!streetViewRef.current) return;

        const panorama = new window.google.maps.StreetViewPanorama(
            streetViewRef.current,
            {
                position: location,
                pov: { heading: 0, pitch: 10 },
                zoom: 0,
                addressControl: true,
                linksControl: true,
                panControl: true,
                enableCloseButton: true,
            }
        );

        const service = new window.google.maps.StreetViewService();
        service.getPanorama({ location, radius: 50 }, (data, status) => {
            if (status === window.google.maps.StreetViewStatus.OK) {
                panorama.setPosition(data.location.latLng);
                animatePanorama(panorama);
                setTimeout(() => {
                    stopAnimation();
                    onClose(); // volta pro mapa
                }, 5000);
            } else {
                alert("Street View não disponível para estas coordenadas.");
                onClose();
            }
        });

        function animatePanorama(pano) {
            let heading = pano.getPov().heading;
            animationRef.current = setInterval(() => {
                heading += 15;
                pano.setPov({ heading, pitch: 10 });

                if (heading >= 400) {
                    stopAnimation();
                }
            }, 200);
        }

        function stopAnimation() {
            if (animationRef.current) {
                clearInterval(animationRef.current);
                animationRef.current = null;
            }
        }

        return () => stopAnimation();

        console.log('Elem StreetView', location, onClose)
    }, [location, onClose]);



    return (
        <div
            ref={streetViewRef}
            style={{ width: '100%', height: '100%', minHeight: '25rem', }}
        ></div>
    );
}

export default ElemStreeView;