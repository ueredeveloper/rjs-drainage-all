
import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import PolylineInfoContent from './PolylineInfoContent';

/**
 * Componente React para InfoWindow de polyline com rendering React completo
 * @component
 * @param {object} props - Propriedades do componente
 * @param {google.maps.Polyline} props.polyline - A polyline
 * @param {object} props.shape - As informações da shape
 * @param {google.maps.Map} props.map - O mapa
 */
const ReactPolylineInfoWindow = ({ polyline, shape, map }) => {
    const [infoWindow, setInfoWindow] = useState(null);
    const theme = useTheme();
    const rootRef = useRef(null);

    useEffect(() => {
        if (!infoWindow && window.google && window.google.maps) {
            const _infoWindow = new window.google.maps.InfoWindow({
                disableAutoPan: false,
            });
            _infoWindow.setZIndex(10);
            setInfoWindow(_infoWindow);
        }

        if (map && polyline && infoWindow) {
            // Remove listeners anteriores
            window.google.maps.event.clearListeners(polyline, 'click');
            
            // Adiciona listener de click
            polyline.addListener('click', (event) => {
                // Criar div container para o React component
                const div = document.createElement('div');
                
                // Criar root do React e renderizar o componente
                const root = createRoot(div);
                root.render(
                    <ThemeProvider theme={theme}>
                        <PolylineInfoContent polyline={polyline} shape={shape} />
                    </ThemeProvider>
                );
                
                // Configurar InfoWindow
                infoWindow.setContent(div);
                infoWindow.setPosition(event.latLng);
                infoWindow.open(map);
                
                // Salvar referência do root para cleanup
                rootRef.current = root;
            });

            // Cleanup quando o InfoWindow for fechado
            infoWindow.addListener('closeclick', () => {
                if (rootRef.current) {
                    rootRef.current.unmount();
                    rootRef.current = null;
                }
            });
        }

        // Cleanup function
        return () => {
            if (polyline && window.google && window.google.maps) {
                window.google.maps.event.clearListeners(polyline, 'click');
            }
            if (rootRef.current) {
                rootRef.current.unmount();
                rootRef.current = null;
            }
        };
    }, [map, polyline, infoWindow, shape, theme]);

    return null;
};

export default ReactPolylineInfoWindow;
