import { useEffect, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import HTMLMarkerContent from "./MarkerContent";
import { createRoot } from "react-dom/client";

/**
 * Componente para exibir informações em uma janela de informações associada a um marcador no mapa.
 *
 * Este componente cria uma InfoWindow do Google Maps que se abre quando um marcador é clicado.
 * O conteúdo é renderizado usando React e depois inserido na InfoWindow nativa do Google Maps.
 *
 * @component
 * @example
 * // Exemplo de uso básico
 * <ElemMarkerInfoWindow
 *   marker={googleMapsMarker}
 *   info={{ title: "Local", description: "Descrição do local" }}
 *   map={googleMapsInstance}
 * />
 *
 * @param {Object} props - Propriedades do componente
 * @param {google.maps.Marker} props.marker - O marcador do Google Maps ao qual a janela de informações está associada
 * @param {Object} props.info - As informações a serem exibidas na janela de informações
 * @param {string} [props.info.title] - Título a ser exibido na janela
 * @param {string} [props.info.description] - Descrição a ser exibida na janela
 * @param {google.maps.Map} props.map - A instância do mapa do Google Maps ao qual o marcador e a janela pertencem
 *
 * @returns {null} - Este componente não renderiza elementos React diretamente, apenas manipula o DOM
 *
 * @requires react
 * @requires @mui/material/styles
 * @requires google.maps (Google Maps JavaScript API)
 *
 * @since 1.0.0
 */
const ElemMarkerInfoWindow = ({ marker, info, map }) => {
    /**
     * Hook para acessar o tema do Material-UI
     * @type {import('@mui/material/styles').Theme}
     */
    const theme = useTheme();

    /**
     * Referência para armazenar a instância do InfoWindow do Google Maps
     * @type {React.MutableRefObject<google.maps.InfoWindow|undefined>}
     */
    const infowindowRef = useRef();

    /**
     * Referência para o container DOM que armazenará o conteúdo React renderizado
     * @type {React.MutableRefObject<HTMLDivElement|undefined>}
     */
    const containerRef = useRef();
    const rootRef = useRef(null);

    /**
     * Efeito para gerenciar o ciclo de vida da InfoWindow
     *
     * Este efeito:
     * 1. Cria um container DOM para o conteúdo React
     * 2. Renderiza o componente HTMLMarkerContent no container
     * 3. Cria ou atualiza a InfoWindow do Google Maps
     * 4. Adiciona listener de clique no marcador
     * 5. Limpa recursos quando o componente é desmontado
     *
     * @effect
     * @listens marker#click - Abre a InfoWindow quando o marcador é clicado
     *
     * @dependencies [map, marker, info, theme.palette.primary.main]
     */
    useEffect(() => {
        /**
         * Cria um container DOM para o conteúdo do InfoWindow se não existir
         */
        if (!containerRef.current) {
            containerRef.current = document.createElement("div");
        }

        /**
         * Renderiza o conteúdo React no container DOM usando importação dinâmica
         * A importação dinâmica evita problemas de SSR (Server-Side Rendering)
         */
        if (!containerRef.current) {
            containerRef.current = document.createElement("div");
        }

        // Create root only once
        if (!rootRef.current) {
            rootRef.current = createRoot(containerRef.current);
        }

        // Render or re-render
        rootRef.current.render(
            <HTMLMarkerContent
                color={theme.palette.primary.main}
                info={info}
            />
        );
        /**
         * Cria uma nova instância do InfoWindow se não existir,
         * caso contrário atualiza o conteúdo da instância existente
         */
        if (!infowindowRef.current) {
            infowindowRef.current = new window.google.maps.InfoWindow({
                content: containerRef.current,
            });
            // Define um z-index alto para garantir que a InfoWindow apareça sobre outros elementos
            infowindowRef.current.setZIndex(10);
        } else {
            // Atualiza o conteúdo se a InfoWindow já existe
            infowindowRef.current.setContent(containerRef.current);
        }

        /**
         * Adiciona listener de clique no marcador para abrir a InfoWindow
         * Verifica se todos os elementos necessários estão disponíveis antes de adicionar o listener
         */
        if (map && marker && infowindowRef.current) {
            marker.addListener("click", () => {
                infowindowRef.current.open({
                    anchor: marker,
                    map: map,
                });
            });
        }

        /**
         * Função de limpeza executada quando o componente é desmontado
         * ou quando as dependências do useEffect mudam
         *
         * @cleanup
         * @returns {Function} Função de limpeza que fecha e remove a InfoWindow
         */
        return () => {
            if (infowindowRef.current) {
                infowindowRef.current.close();
                infowindowRef.current = null;
            }
        };
    }, [map, marker, info, theme.palette.primary.main]);

    /**
     * Este componente não renderiza elementos React diretamente.
     * Toda a manipulação é feita via efeitos colaterais no DOM.
     */
    return null;
};

export default ElemMarkerInfoWindow;
