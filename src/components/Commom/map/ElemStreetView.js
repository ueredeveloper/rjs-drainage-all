import { useRef, useEffect, useState } from "react";


// Componente que renderiza o Street View



const ElemStreetView = ({ streetViewLocation, setStreetViewLocation }) => {

    const ref = useRef();
    const [_interval, _setInterval] = useState();

    useEffect(() => {

        console.log(streetViewLocation)
        // Inicializa o Street View
        const panorama = new window.google.maps.StreetViewPanorama(
            ref.current,
            {
                position: streetViewLocation, // Coordenadas específicas
                pov: {
                    heading: 165, // Orientação da câmera (em graus)
                    pitch: 0, // Ângulo vertical da câmera
                },
                zoom: 1, // Nível de zoom inicial
                addressControl: false, // Desativa controles de endereço
                linksControl: true, // Mostra links para navegação no Street View
                panControl: true, // Controles de panorâmica
                enableCloseButton: false, // Desativa botão de fechar
            }
        );

        let heading = 0;
        const _intervalo = setInterval(function () {

            heading += 10;

            panorama.setPov({
                heading: heading, // Ângulo de visão (0 é norte)
                pitch: 10   // Inclinação da câmera
            })
            console.log(heading)
            if (heading > 360) {
                clearInterval(_intervalo);
                setStreetViewLocation(null)
                console.log("Contagem finalizada!");
            }
        }, 100);

        _setInterval(_intervalo)


    }, []);


    return streetViewLocation && <div ref={ref} style={{ width: '100%', height: '100%', minHeight: '25rem' }} />;
};

export default ElemStreetView