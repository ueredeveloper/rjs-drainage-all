import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import PolygonInfoContent from "./PolygonContent";
import { useData } from "../../../../hooks/analyse-hooks";

/**
 * Componente para exibir informações em uma janela de informações associada a um polígono no mapa.
 *
 * @component
 * @param {Object} props
 * @param {google.maps.Polygon} props.polygon - O polígono do Google Maps.
 * @param {Object} props.shape - Dados do polígono.
 * @param {google.maps.Map} props.map - Instância do mapa.
 * @returns {null}
 */
const ElemPolygonInfoWindow = ({ polygon, shape, map }) => {
    const [infoWindow, setInfoWindow] = useState(null);
    const { setOverlays } = useData();
    const theme = useTheme();
    const rootRef = useRef(null);

    useEffect(() => {
        // Cria a InfoWindow se ainda não existir
        if (!infoWindow && window.google && window.google.maps) {
            const _infoWindow = new window.google.maps.InfoWindow({});
            _infoWindow.setZIndex(10);
            setInfoWindow(_infoWindow);
        }

        // Configura listeners e renderização React na InfoWindow
        if (map && polygon && infoWindow) {
            // Remove listeners antigos para evitar duplicidade
            window.google.maps.event.clearListeners(polygon, "click");

            // Listener para abrir a InfoWindow ao clicar no polígono
            polygon.addListener("click", (event) => {
                const div = document.createElement("div");
                const root = createRoot(div);

                root.render(
                    <ThemeProvider theme={theme}>
                        <PolygonInfoContent
                            polygon={polygon}
                            shape={shape}
                            map={map}
                            setOverlays={setOverlays}
                            color={theme.palette.primary.main}
                        />
                    </ThemeProvider>,
                );

                infoWindow.setContent(div);
                infoWindow.setPosition(event.latLng);
                infoWindow.open(map);

                rootRef.current = root;
            });

            // Limpa o React Root ao fechar a InfoWindow
            infoWindow.addListener("closeclick", () => {
                if (rootRef.current) {
                    rootRef.current.unmount();
                    rootRef.current = null;
                }
            });
        }

        // Limpeza ao desmontar ou atualizar dependências
        return () => {
            if (polygon && window.google && window.google.maps) {
                window.google.maps.event.clearListeners(polygon, "click");
            }
            if (rootRef.current) {
                rootRef.current.unmount();
                rootRef.current = null;
            }
        };
    }, [map, polygon, infoWindow, shape, theme, setOverlays]);

    // Não renderiza nada diretamente no DOM React
    return null;
};

export default ElemPolygonInfoWindow;
