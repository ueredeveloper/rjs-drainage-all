// PolygonContent.js
import React, { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import { fetchGrantsInsideShape } from "../../../../services/shapes";


/**
 * Componente React que exibe informações detalhadas sobre um polígono
 * e permite buscar outorgas dentro da área do polígono.
 *
 * @component
 * @param {Object} props
 * @param {google.maps.Polygon} props.polygon - Instância do Polígono no mapa do Google.
 * @param {Object} props.shape - Objeto contendo as propriedades e geometria da shape associada.
 * @param {google.maps.Map} props.map - Instância do mapa do Google.
 * @param {Function} props.setOverlays - Função para atualizar overlays no mapa.
 * @param {string} props.color - Cor principal para o cabeçalho.
 * @param {Function} props.closeInfoWindow - Função para fechar a InfoWindow.
 * @param {Function} props.onSuccess - Função para exibir o alerta de sucesso global.
 * @returns {JSX.Element}
 */
const PolygonInfoContent = ({
    polygon,
    shape,
    map,
    setOverlays,
    color,
    closeInfoWindow,
    onSuccess, // <-- Nova prop para acionar o alerta global
}) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);

    // Helper para acessar propriedades do shape de forma segura
    const get = (key) => shape?.[key] ?? shape?.properties?.[key] ?? "";

    // Função para buscar outorgas da mesma forma que o código original
    const handleSearchGrants = async () => {
        setLoading(true);
        try {
            let shapeCode;
            let shapeName = get("shapeName");

            if (shapeName === "bacias_hidrograficas") {
                shapeCode = get("bacia_cod");
            } else if (shapeName === "unidades_hidrograficas") {
                shapeCode = get("uh_codigo");
            } else {
                shapeCode = get("cod_plan");
            }

            const markers = await fetchGrantsInsideShape(shapeName, shapeCode);

            const _shape = {
                id: Date.now(),
                type: "polygon",
                position: null,
                map,
                draw: polygon,
                markers,
                area: null,
            };

            setOverlays((prev) => ({
                ...prev,
                shapes: [...prev.shapes, _shape],
            }));

            // Aciona o alerta global de sucesso
            if (onSuccess) onSuccess();

            // Fecha a InfoWindow automaticamente após sucesso
            if (closeInfoWindow) closeInfoWindow();
        } catch (error) {
            alert("Erro ao buscar outorgas.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Títulos conforme o shape
    let title1, title2;
    if (get("shapeName") === "bacias_hidrograficas") {
        title1 = `Nome da Bacia: ${get("bacia_nome")}`;
        title2 = `Bacia Código: ${get("bacia_cod")}`;
    } else if (get("shapeName") === "unidades_hidrograficas") {
        title1 = `Nome da UH: ${get("uh_nome")}`;
        title2 = `${get("uh_label")}`;
    } else if (get("shapeName") === "hidrogeo_poroso") {
        title1 = `Sistema: ${get("sistema")}`;
        title2 = `Código: ${get("cod_plan")}`;
    } else {
        title1 = `Sistema: ${get("sistema")}, Subsistema: ${get("subsistema")}`;
        title2 = `Código: ${get("cod_plan")}`;
    }

    // Botão de busca de outorgas
    const btnSearch = (
        <Button
            variant="contained"
            color="primary"
            startIcon={
                loading ? (
                    <CircularProgress size={16} color="inherit" />
                ) : (
                    <SearchIcon />
                )
            }
            onClick={handleSearchGrants}
            disabled={loading}
            sx={{ minWidth: 140 }}
        >
            {loading ? "Buscando..." : "Buscar Outorgas"}
        </Button>
    );

    return (
        <Paper elevation={2} sx={{ width: "100%", minHeight: "250px" }}>
            {/* Cabeçalho */}
            <Box
                sx={{
                    backgroundColor: color || theme.palette.primary.main,
                    color: "white",
                    p: 1.5,
                    textAlign: "center",
                }}
            >
                <Typography variant="h6" component="h3">
                    {title1}
                </Typography>
                <Typography variant="subtitle1">{title2}</Typography>
            </Box>

            {/* Corpo com informações detalhadas */}
            <Box sx={{ p: 2, maxHeight: "180px", overflowY: "auto" }}>
                <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
                    Informações
                </Typography>

                {/* Seção específica para bacias hidrográficas */}
                {(get("shapeName") === "bacias_hidrograficas" ||
                    !!get("bacia_nome") ||
                    !!get("bacia_cod")) && (
                        <>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>Nome da Bacia:</strong>{" "}
                                {get("bacia_nome") || "Não informado"}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                <strong>Bacia Código:</strong>{" "}
                                {get("bacia_cod") || ""}
                            </Typography>
                        </>
                    )}

                {/* Seção específica para unidades hidrográficas */}
                {get("shapeName") === "unidades_hidrograficas" && (
                    <>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Nome da UH:</strong>{" "}
                            {get("uh_nome") || "Não informado"}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Código da UH:</strong>{" "}
                            {get("uh_codigo") || "Não informado"}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Label:</strong>{" "}
                            {get("uh_label") || "Não informado"}
                        </Typography>
                    </>
                )}

                {/* Seção específica para sistemas hidrogeológicos */}
                {(get("shapeName") === "hidrogeo_poroso" ||
                    get("shapeName") === "hidrogeo_fraturado") && (
                        <>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>Sistema:</strong>{" "}
                                {get("sistema") || "Não informado"}
                            </Typography>
                            {get("subsistema") && (
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Subsistema:</strong> {get("subsistema")}
                                </Typography>
                            )}
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>Código:</strong>{" "}
                                {get("cod_plan") || "Não informado"}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>Número de Poços:</strong>{" "}
                                {get("qtd_pocos") || "0"}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>Porcentagem de Utilização:</strong>{" "}
                                {get("pct_utilizada") + "%" || "0%"}
                            </Typography>
                        </>
                    )}


                {/* Botão de busca */}
                <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                    {btnSearch}
                </Box>
            </Box>
        </Paper>
    );
};

export default PolygonInfoContent;
