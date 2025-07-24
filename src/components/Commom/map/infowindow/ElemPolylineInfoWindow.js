import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import PolylineInfoContent from "./PolylineContent";

/**
 * Componente para exibir informações em uma janela de informações associada a uma polyline no mapa.
 *
 * Este componente cria uma InfoWindow do Google Maps que se abre quando uma polyline é clicada.
 * Utiliza React 18's createRoot API para renderizar componentes React completos dentro da InfoWindow,
 * incluindo suporte completo ao tema do Material-UI e gerenciamento adequado do ciclo de vida.
 *
 * @component
 * @example
 * // Exemplo de uso básico
 * <ElemPolylineInfoWindow
 *   polyline={googleMapsPolyline}
 *   shape={{ id: 1, name: "Rota A", distance: 5.2 }}
 *   map={googleMapsInstance}
 * />
 *
 * @param {Object} props - Propriedades do componente
 * @param {google.maps.Polyline} props.polyline - A polyline do Google Maps à qual a janela de informações está associada
 * @param {Object} props.shape - Os dados da polyline/forma a serem exibidos na janela de informações
 * @param {string} [props.shape.id] - Identificador único da polyline
 * @param {string} [props.shape.name] - Nome da polyline/rota
 * @param {number} [props.shape.distance] - Distância da polyline em quilômetros
 * @param {google.maps.Map} props.map - A instância do mapa do Google Maps
 *
 * @returns {null} - Este componente não renderiza elementos React diretamente, apenas manipula o DOM
 *
 * @requires react
 * @requires react-dom/client
 * @requires @mui/material/styles
 * @requires google.maps (Google Maps JavaScript API)
 *
 * @since 1.0.0
 * @version React 18+
 */
const ElemPolylineInfoWindow = ({ polyline, shape, map }) => {
    /**
     * Estado para armazenar a instância da InfoWindow do Google Maps
     * @type {[google.maps.InfoWindow|null, Function]}
     */
    const [infoWindow, setInfoWindow] = useState(null);

    /**
     * Hook para acessar o tema atual do Material-UI
     * Necessário para passar o tema para o componente renderizado na InfoWindow
     * @type {import('@mui/material/styles').Theme}
     */
    const theme = useTheme();

    /**
     * Referência para armazenar a instância do React Root (React 18+)
     * Usado para gerenciar o ciclo de vida dos componentes React renderizados na InfoWindow
     * @type {React.MutableRefObject<import('react-dom/client').Root|null>}
     */
    const rootRef = useRef(null);

    /**
     * Efeito para gerenciar o ciclo de vida da InfoWindow e renderização React
     *
     * Este efeito:
     * 1. Cria a instância da InfoWindow quando disponível
     * 2. Remove listeners anteriores para evitar duplicações
     * 3. Adiciona listener de clique na polyline
     * 4. Renderiza componente React completo com tema na InfoWindow
     * 5. Gerencia limpeza adequada dos React Roots
     * 6. Limpa recursos quando o componente é desmontado
     *
     * @effect
     * @listens polyline#click - Abre a InfoWindow na posição do clique
     * @listens infoWindow#closeclick - Limpa o React Root quando a InfoWindow é fechada
     *
     * @dependencies [map, polyline, infoWindow, shape, theme]
     */
    useEffect(() => {
        /**
         * Cria uma nova instância da InfoWindow se ainda não existir
         * e se a API do Google Maps estiver disponível
         */
        if (!infoWindow && window.google && window.google.maps) {
            const _infoWindow = new window.google.maps.InfoWindow({
                disableAutoPan: false, // Permite que o mapa se mova para mostrar a InfoWindow completa
            });
            // Define z-index alto para garantir que a InfoWindow apareça sobre outros elementos
            _infoWindow.setZIndex(10);
            setInfoWindow(_infoWindow);
        }

        /**
         * Configura os event listeners se todos os elementos necessários estão disponíveis
         */
        if (map && polyline && infoWindow) {
            /**
             * Remove listeners anteriores para evitar acúmulo de event listeners
             * Importante para prevenir vazamentos de memória e comportamentos inesperados
             */
            window.google.maps.event.clearListeners(polyline, "click");

            /**
             * Listener para clique na polyline
             *
             * @param {google.maps.PolyMouseEvent} event - Evento de clique do Google Maps
             * @param {google.maps.LatLng} event.latLng - Coordenadas do clique na polyline
             */
            polyline.addListener("click", (event) => {
                /**
                 * Cria um container DOM para renderizar o componente React
                 * @type {HTMLDivElement}
                 */
                const div = document.createElement("div");

                /**
                 * Cria uma nova instância do React Root usando a API do React 18
                 * @type {import('react-dom/client').Root}
                 */
                const root = createRoot(div);

                /**
                 * Renderiza o componente React completo dentro da InfoWindow
                 * Inclui ThemeProvider para manter consistência visual com o resto da aplicação
                 */
                root.render(
                    <ThemeProvider theme={theme}>
                        <PolylineInfoContent
                            polyline={polyline}
                            shape={shape}
                        />
                    </ThemeProvider>,
                );

                // Configura o conteúdo e posição da InfoWindow
                infoWindow.setContent(div);
                infoWindow.setPosition(event.latLng);
                infoWindow.open(map);

                /**
                 * Salva referência do root para permitir limpeza adequada posteriormente
                 * Essencial para evitar vazamentos de memória
                 */
                rootRef.current = root;
            });

            /**
             * Listener para fechamento da InfoWindow
             *
             * Executa limpeza do React Root quando a InfoWindow é fechada pelo usuário
             * Previne vazamentos de memória ao desmontar adequadamente os componentes React
             */
            infoWindow.addListener("closeclick", () => {
                if (rootRef.current) {
                    rootRef.current.unmount();
                    rootRef.current = null;
                }
            });
        }

        /**
         * Função de limpeza executada quando o componente é desmontado
         * ou quando as dependências do useEffect mudam
         *
         * Responsável por:
         * - Remover todos os event listeners da polyline
         * - Desmontar o React Root se ainda existir
         * - Limpar referências para evitar vazamentos de memória
         *
         * @cleanup
         * @returns {Function} Função de limpeza que remove listeners e desmonta React Roots
         */
        return () => {
            // Remove listeners da polyline
            if (polyline && window.google && window.google.maps) {
                window.google.maps.event.clearListeners(polyline, "click");
            }

            // Desmonta React Root se existir
            if (rootRef.current) {
                rootRef.current.unmount();
                rootRef.current = null;
            }
        };
    }, [map, polyline, infoWindow, shape, theme]);

    /**
     * Este componente não renderiza elementos React diretamente.
     * Toda a renderização é gerenciada via React Roots dentro das InfoWindows do Google Maps.
     *
     * @returns {null} Não retorna JSX, apenas gerencia efeitos colaterais
     */
    return null;
};

export default ElemPolylineInfoWindow;
