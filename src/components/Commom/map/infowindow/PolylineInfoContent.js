
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
                totalDistance += window.google.maps.geometry.spherical.computeDistanceBetween(
                    path.getAt(i),
                    path.getAt(i + 1)
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
        <Paper elevation={2} sx={{ width: '100%', minHeight: '200px' }}>
            <Box
                sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    p: 1.5,
                    textAlign: 'center'
                }}
            >
                <Typography variant="h6" component="h3">
                    {shape?.properties?.name || 'Informações da Linha'}
                </Typography>
            </Box>
            
            <Box sx={{ p: 2, maxHeight: '140px', overflowY: 'auto' }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Tipo:</strong> {shape?.properties?.type || 'Linha'}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Comprimento:</strong> {formatDistance(distance)}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Pontos:</strong> {path ? path.getLength() : 0}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Descrição:</strong> {shape?.properties?.description || 'Linha geométrica'}
                </Typography>
                
                {shape?.geometry?.coordinates && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Coordenadas:</strong> {shape.geometry.coordinates.length} pontos
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

export default PolylineInfoContent;
