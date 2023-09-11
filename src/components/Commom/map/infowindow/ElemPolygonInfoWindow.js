/**
 * Componente para exibir informações em uma janela de informações associada a um marcador no mapa.
 *
 * @param {object} props - Propriedades do componente.
 * @param {google.maps.Polygon} props.marker - O polígono ao qual a janela de informações está associada.
 * @param {object} props.shape - As informações a serem exibidas na janela.
 * @param {google.maps.Map} props.map - O mapa ao qual o polígono e a janela de informações pertencem.
 * @returns {null} Retorna null, pois este componente não possui renderização visível.
 */
import { useContext, useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import HTMLPolygonContent from './html-polygon-content';
import { AnalyseContext } from '../../../MainFlow/Analyse';
import { useData } from '../../../../hooks/analyse-hooks';

const ElemPolygonInfoWindow = ({ polygon, shape, map }) => {

    /**
     * Estado que controla a instância da janela de informações.
     * @type {google.maps.InfoWindow}
     */
    const [infowindow, setInfowindow] = useState();
   // const [, , , , , setOverlays] = useContext(AnalyseContext)
   const {setOverlays} = useData()



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

        // Atualiza a posição da janela de informações ao marcador.
        if (map && polygon && infowindow) {
            // Adiciona um listener para abrir a janela de informações quando o marcador for clicado.
            if (polygon) {
                polygon.addListener("click", function (event) {
                    infowindow.setPosition(event.latLng);
                    infowindow.open(map);
                });
                updateInfoWindowContent(infowindow, HTMLPolygonContent(polygon, shape, map, setOverlays, theme.palette.primary.main))
            }
        }
    }, [map, polygon, infowindow]);

    // Retorna null, pois este componente não possui renderização visível.
    return null;
};

export default ElemPolygonInfoWindow;
