import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';


export const FONT_SIZE_OPTIONS = [12, 14, 16, 18, 20];
export const FONT_SIZE_STORAGE_KEY = 'nd-font-size';
export const DEFAULT_FONT_SIZE = 16;
export const MAP_PROVIDER_STORAGE_KEY = 'nd-map-provider';
export const MAP_PROVIDER_OPTIONS = [
  { value: 'gmaps',   label: 'Google Maps' },
  { value: 'leaflet', label: 'Leaflet' },
];
export const DEFAULT_MAP_PROVIDER = 'gmaps';
const SETTINGS_UI_FONT_SIZE = 12;

/**
 * Painel de configurações que desliza da direita para a esquerda.
 */
export default function SettingsPanel({ open, onClose, fontSize, onFontSizeChange, mapProvider, onMapProviderChange }) {
  return (
    <>
      {/* Overlay */}
      <Box
        onClick={onClose}
        sx={{
          position: 'fixed',
          inset: 0,
          bgcolor: 'rgba(0, 0, 0, 0.45)',
          zIndex: 1400,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Painel — UI fixa em 12px; só a pré-visualização reflete a escolha do usuário */}
      <Box
        role="dialog"
        aria-label="Configurações"
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: { xs: '100%', sm: 360 },
          maxWidth: '100vw',
          bgcolor: '#fff',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.18)',
          zIndex: 1500,
          display: 'flex',
          flexDirection: 'column',
          fontSize: `${SETTINGS_UI_FONT_SIZE}px`,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Cabeçalho do painel */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 1,
            bgcolor: '#003566',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <SettingsIcon sx={{ fontSize: '1.15em', color: '#48cae4' }} />
          <Typography sx={{ flex: 1, fontWeight: 700, fontSize: '1em', letterSpacing: 0.3 }}>
            Configurações
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            aria-label="Fechar configurações"
            sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Conteúdo */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.75em',
              color: '#1565c0',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              mb: 1,
            }}
          >
            Tamanho da fonte
          </Typography>

          <Typography sx={{ fontSize: '0.85em', color: '#546e7a', mb: 1.5, lineHeight: 1.45 }}>
            Ajuste o tamanho base do texto em todo o sistema.
          </Typography>

          <ToggleButtonGroup
            value={fontSize}
            exclusive
            onChange={(_, value) => value && onFontSizeChange(value)}
            sx={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              gap: 0.5,
              width: 'auto',
              '& .MuiToggleButtonGroup-grouped': {
                flex: '0 0 auto',
                width: 'auto',
                minWidth: 0,
                borderRadius: '4px !important',
                border: '1px solid #90caf9 !important',
                margin: 0,
              },
              '& .MuiToggleButton-root': {
                py: 0.1,
                px: 0.6,
                minHeight: 20,
                fontSize: '0.75em',
                fontWeight: 600,
                lineHeight: 1.1,
                textTransform: 'none',
                borderColor: '#90caf9',
                color: '#1565c0',
                '&.Mui-selected': {
                  bgcolor: '#1565c0',
                  color: '#fff',
                  '&:hover': { bgcolor: '#0d47a1' },
                },
                '&:hover': { bgcolor: '#e3f2fd' },
              },
            }}
          >
            {FONT_SIZE_OPTIONS.map((size) => (
              <ToggleButton key={size} value={size} aria-label={`Fonte ${size}px`}>
                {size}px
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: '#f5f9ff',
              border: '1px solid #e3f2fd',
            }}
          >
            <Typography sx={{ fontSize: `${fontSize}px`, color: '#37474f', lineHeight: 1.5 }}>
              Pré-visualização: texto com {fontSize}px de tamanho base.
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.75em',
              color: '#1565c0',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              mb: 1,
            }}
          >
            Mapa
          </Typography>

          <Typography sx={{ fontSize: '0.85em', color: '#546e7a', mb: 1.5, lineHeight: 1.45 }}>
            Escolha o provedor de mapas utilizado na visualização.
          </Typography>

          <ToggleButtonGroup
            value={mapProvider}
            exclusive
            onChange={(_, value) => value && onMapProviderChange(value)}
            sx={{
              display: 'inline-flex',
              gap: 0.5,
              '& .MuiToggleButtonGroup-grouped': {
                flex: '0 0 auto',
                borderRadius: '4px !important',
                border: '1px solid #90caf9 !important',
                margin: 0,
              },
              '& .MuiToggleButton-root': {
                py: 0.1,
                px: 1,
                minHeight: 20,
                fontSize: '0.75em',
                fontWeight: 600,
                lineHeight: 1.1,
                textTransform: 'none',
                color: '#1565c0',
                '&.Mui-selected': {
                  bgcolor: '#1565c0',
                  color: '#fff',
                  '&:hover': { bgcolor: '#0d47a1' },
                },
                '&:hover': { bgcolor: '#e3f2fd' },
              },
            }}
          >
            {MAP_PROVIDER_OPTIONS.map(({ value, label }) => (
              <ToggleButton key={value} value={value} aria-label={label}>
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Box>
    </>
  );
}
