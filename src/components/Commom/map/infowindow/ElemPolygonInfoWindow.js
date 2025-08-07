// ElemPolygonInfoWindow.js
import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import PolygonInfoContent from "./PolygonContent";
import { useData } from "../../../../hooks/analyse-hooks";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

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

    // Estado para o alerta de sucesso global
    const [successOpen, setSuccessOpen] = useState(false);

    // Função para fechar a InfoWindow
    const handleCloseInfoWindow = () => {
        if (infoWindow) {
            infoWindow.close();
        }
    };

    // Função para mostrar o alerta de sucesso
    const handleShowSuccess = () => setSuccessOpen(true);

    // Função para fechar o alerta de sucesso
    const handleCloseSuccess = (event, reason) => {
        if (reason === "clickaway") return;
        setSuccessOpen(false);
    };

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
                            closeInfoWindow={handleCloseInfoWindow}
                            onSuccess={handleShowSuccess}
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

    // Renderiza o Snackbar global sobre o mapa
    return (
        <>
            <Snackbar
                open={successOpen}
                autoHideDuration={3500}
                onClose={handleCloseSuccess}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={handleCloseSuccess}
                    severity="success"
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    Outorgas carregadas com sucesso!
                </Alert>
            </Snackbar>
        </>
    );
};

export default ElemPolygonInfoWindow;
