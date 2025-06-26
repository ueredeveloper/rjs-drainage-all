
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import HTMLPolylineContent from './html-polyline-content';

/**
 * Componente para exibir informações em uma janela de informações associada a uma polyline no mapa.
 * @component
 * @param {object} props - Propriedades do componente.
 * @param {google.maps.Polyline} props.polyline - A polyline ao qual a janela de informações está associada.
 * @param {object} props.shape - As informações a serem exibidas na janela.
 * @param {google.maps.Map} props.map - O mapa ao qual a polyline e a janela de informações pertencem.
 */
const ElemPolylineInfoWindow = ({ polyline, shape, map }) => {

    /**
     * Estado que controla a instância da janela de informações.
     * @type {google.maps.InfoWindow}
     */
    const [infowindow, setInfowindow] = useState();

    /**
     * O tema do Material-UI sendo utilizado no componente.
     */
    const theme = useTheme();

    function updateInfoWindowContent(myInfowindow, newContent) {
        myInfowindow.setContent(newContent);
    }

    useEffect(() => {
        // Cria a instância da janela de informações caso ainda não exista.
        if (!infowindow) {
            let _infowindow = new window.google.maps.InfoWindow({});
            // Sobrepor a janela de informações ao popup do polígono, retângulo, etc...
            _infowindow.setZIndex(10);

            setInfowindow(_infowindow);
        }

        // Atualiza a posição da janela de informações à polyline.
        if (map && polyline && infowindow) {
            // Adiciona um listener para abrir a janela de informações quando a polyline for clicada.
            if (polyline) {
                polyline.addListener("click", function (event) {
                    infowindow.setPosition(event.latLng);
                    infowindow.open(map);
                });
                updateInfoWindowContent(infowindow, HTMLPolylineContent(polyline, shape, map, theme.palette.primary.main))
            }
        }
    }, [map, polyline, infowindow, shape, theme.palette.primary.main]);

    // Retorna null, pois este componente não possui renderização visível.
    return null;
};

export default ElemPolylineInfoWindow;
