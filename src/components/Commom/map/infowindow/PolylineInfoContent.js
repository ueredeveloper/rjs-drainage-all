
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Componente React para exibir informações da polyline
 * @component
 * @param {object} props - Propriedades do componente
 * @param {google.maps.Polyline} props.polyline - A polyline
 * @param {object} props.shape - As informações da shape
 */
const PolylineInfoContent = ({ polyline, shape }) => {
    const theme = useTheme();

    // Calcula o comprimento da polyline
    const calculateDistance = () => {
        let totalDistance = 0;
        const path = polyline?.getPath();
        
        if (path && path.getLength() > 1 && window.google?.maps?.geometry?.spherical) {
            for (let i = 0; i < path.getLength() - 1; i++) {

                //calcula a distância entre dois pontos consecutivos
                totalDistance += window.google.maps.geometry.spherical.computeDistanceBetween(
                    path.getAt(i), //ponto atual
                    path.getAt(i + 1) //próximo ponto
                );
            }
        }
        return totalDistance;
    };

    // Formatar distância
    const formatDistance = (distance) => {
        if (distance >= 1000) {
            return `${(distance / 1000).toFixed(2)} km`;
        }
        return `${distance.toFixed(2)} m`;
    };

    const distance = calculateDistance();
    const path = polyline?.getPath();

    return (
        <Paper elevation={2} sx={{ width: '100%', minHeight: '250px' }}>
            <Box
                sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    p: 1.5,
                    textAlign: 'center'
                }}
            >
                <Typography variant="h6" component="h3">
                    {shape?.properties?.nome || 'Rio do DF'}
                </Typography>
            </Box>
            
            <Box sx={{ p: 2, maxHeight: '180px', overflowY: 'auto' }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Nome:</strong> {shape?.properties?.nome || 'Não informado'}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Afluente Esquerdo:</strong> {shape?.properties?.aflu_esq?.trim() || 'Não informado'}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Afluente Direito:</strong> {shape?.properties?.aflu_dir?.trim() || 'Não informado'}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Classe:</strong> {shape?.properties?.classe || 'Não informado'}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Região Administrativa:</strong> {shape?.properties?.ra || 'Não informado'}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Extensão:</strong> {shape?.properties?.extensao ? `${shape.properties.extensao.toLocaleString()} m` : 'Não informado'}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>É Perene:</strong> {shape?.properties?.perene || 'Não informado'}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Comprimento Calculado:</strong> {formatDistance(distance)}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Pontos no Mapa:</strong> {path ? path.getLength() : 0}
                </Typography>
                
                {shape?.properties?.observacao?.trim() && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Observações:</strong> {shape.properties.observacao}
                    </Typography>
                )}
                
                {shape?.geometry?.coordinates && (
                    <Typography variant="body2" sx={{ mb: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                        <strong>ID:</strong> {shape?.properties?.objectid || shape?.properties?.OBJECTID_1}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

export default PolylineInfoContent;
