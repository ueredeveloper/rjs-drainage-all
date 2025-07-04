import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";

/**
 * Componente React que exibe informações detalhadas sobre uma polyline
 * e seu shape associado. Ideal para uso em mapas interativos.
 *
 * @component
 * @param {Object} props - Propriedades do componente.
 * @param {google.maps.Polyline} props.polyline - Instância da Polyline no mapa do Google.
 * @param {Object} props.shape - Objeto contendo as propriedades e geometria da shape associada.
 * @returns {JSX.Element} O componente renderizado com as informações formatadas.
 */
const PolylineInfoContent = ({ polyline, shape }) => {
    const theme = useTheme();

    /**
     * Calcula a distância total da polyline com base em seus pontos.
     * Utiliza a API de geometria esférica do Google Maps.
     *
     * @function
     * @returns {number} Distância total em metros.
     */
    const calculateDistance = () => {
        let totalDistance = 0;
        const path = polyline?.getPath();

        if (
            path &&
            path.getLength() > 1 &&
            window.google?.maps?.geometry?.spherical
        ) {
            for (let i = 0; i < path.getLength() - 1; i++) {
                totalDistance +=
                    window.google.maps.geometry.spherical.computeDistanceBetween(
                        path.getAt(i),
                        path.getAt(i + 1),
                    );
            }
        }
        return totalDistance;
    };

    /**
     * Formata uma distância em metros para uma string legível em metros ou quilômetros.
     *
     * @function
     * @param {number} distance - Distância em metros.
     * @returns {string} Distância formatada (ex: "1.25 km" ou "850.00 m").
     */
    const formatDistance = (distance) => {
        if (distance >= 1000) {
            return `${(distance / 1000).toFixed(2)} km`;
        }
        return `${distance.toFixed(2)} m`;
    };

    const distance = calculateDistance();
    const path = polyline?.getPath();

    return (
        <Paper elevation={2} sx={{ width: "100%", minHeight: "250px" }}>
            <Box
                sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: "white",
                    p: 1.5,
                    textAlign: "center",
                }}
            >
                <Typography variant="h6" component="h3">
                    {shape?.properties?.nome || "Rio do DF"}
                </Typography>
            </Box>

            <Box sx={{ p: 2, maxHeight: "180px", overflowY: "auto" }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Nome:</strong>{" "}
                    {shape?.properties?.nome || "Não informado"}
                </Typography>

                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Afluente Esquerdo:</strong>{" "}
                    {shape?.properties?.aflu_esq?.trim() || "Não informado"}
                </Typography>

                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Afluente Direito:</strong>{" "}
                    {shape?.properties?.aflu_dir?.trim() || "Não informado"}
                </Typography>

                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Classe:</strong>{" "}
                    {shape?.properties?.classe || "Não informado"}
                </Typography>

                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Região Administrativa:</strong>{" "}
                    {shape?.properties?.ra || "Não informado"}
                </Typography>

                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Extensão:</strong>{" "}
                    {shape?.properties?.extensao
                        ? `${shape.properties.extensao.toLocaleString()} m`
                        : "Não informado"}
                </Typography>

                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>É Perene:</strong>{" "}
                    {shape?.properties?.perene || "Não informado"}
                </Typography>

                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Comprimento Calculado:</strong>{" "}
                    {formatDistance(distance)}
                </Typography>

                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Pontos no Mapa:</strong>{" "}
                    {path ? path.getLength() : 0}
                </Typography>

                {shape?.properties?.observacao?.trim() && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Observações:</strong>{" "}
                        {shape.properties.observacao}
                    </Typography>
                )}

                {shape?.geometry?.coordinates && (
                    <Typography
                        variant="body2"
                        sx={{
                            mb: 1,
                            fontSize: "0.75rem",
                            color: "text.secondary",
                        }}
                    >
                        <strong>ID:</strong>{" "}
                        {shape?.properties?.objectid ||
                            shape?.properties?.OBJECTID_1}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

export default PolylineInfoContent;
