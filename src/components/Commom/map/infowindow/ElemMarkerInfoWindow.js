/**
 * Componente para exibir informações em uma janela de informações associada a um marcador no mapa.
 *
 * @param {object} props - Propriedades do componente.
 * @param {google.maps.Marker} props.marker - O marcador ao qual a janela de informações está associada.
 * @param {object} props.info - As informações a serem exibidas na janela.
 * @param {google.maps.Map} props.map - O mapa ao qual o marcador e a janela de informações pertencem.
 * @returns {null} Retorna null, pois este componente não possui renderização visível.
 */
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import HTMLMarkerContent from './html-marker-content';

const ElemMarkerInfoWindow = ({ marker, info, map }) => {

    /**
     * Estado que controla a instância da janela de informações.
     * @type {google.maps.InfoWindow}
     */
    const [infowindow, setInfowindow] = useState();

    /**
     * O tema do Material-UI sendo utilizado no componente.
     */
    const theme = useTheme();

    useEffect(() => {
        // Cria a instância da janela de informações caso ainda não exista.
        if (!infowindow) {
            let _infowindow = new window.google.maps.InfoWindow({
                content: HTMLMarkerContent(theme.palette.primary.main, info)
            });
            // Sobrepor a janela de informações ao popup do polígono, retângulo, etc...
            _infowindow.setZIndex(10);
    
            setInfowindow(_infowindow);
        }

        // Atualiza a posição da janela de informações ao marcador.
        if (map && marker && infowindow) {
            // Adiciona um listener para abrir a janela de informações quando o marcador for clicado.
            if (marker) {
                marker.addListener("click", () => {
                    infowindow.open({
                        anchor: marker,
                        map: map,
                    });
                });
            }
        }
    }, [map, marker, infowindow]);

    // Retorna null, pois este componente não possui renderização visível.
    return null;
};

/**
 * Função que gera o conteúdo da janela de informações.
 *
 * @param {string} color - A cor de fundo da janela de informações.
 * @param {object} info - As informações a serem exibidas.
 * @returns {HTMLElement} Retorna o elemento div com o conteúdo da janela de informações.
 */

export default ElemMarkerInfoWindow;
