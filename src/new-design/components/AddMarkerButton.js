import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';

/**
 * Converte o texto de um input de coordenada (aceita vírgula decimal) em número
 * dentro do limite informado, ou null se inválido.
 * @param {string} raw - Texto digitado
 * @param {number} max - Valor absoluto máximo (90 para latitude, 180 para longitude)
 * @returns {number|null}
 */
function parseCoord(raw, max) {
  const v = parseFloat(String(raw ?? '').trim().replace(',', '.'));
  return Number.isFinite(v) && Math.abs(v) <= max ? v : null;
}

/**
 * Botão das barras de busca por coordenadas que apenas adiciona um marcador no
 * mapa na coordenada digitada (sem buscar outorgas) — mesmo comportamento do
 * botão "Adicionar marcador" da barra de ferramentas do mapa.
 *
 * @param {Object} props
 * @param {string} props.lat - Latitude digitada
 * @param {string} props.lng - Longitude digitada
 * @param {(pos: {lat: number, lng: number}) => void} props.onAddMarker - Adiciona o marcador
 */
export default function AddMarkerButton({ lat, lng, onAddMarker }) {
  const latN = parseCoord(lat, 90);
  const lngN = parseCoord(lng, 180);
  const valid = latN !== null && lngN !== null;

  return (
    <Tooltip title={valid ? 'Adicionar marcador nesta coordenada (sem buscar)' : 'Informe uma latitude e longitude válidas'}>
      <span>
        <IconButton
          size="small"
          disabled={!valid || !onAddMarker}
          onClick={() => onAddMarker({ lat: latN, lng: lngN })}
          sx={{ flexShrink: 0, color: '#1565c0', border: '1px solid #90caf9', borderRadius: 1, p: 0.7, '&.Mui-disabled': { color: '#90a4ae', borderColor: '#cfd8dc' } }}
        >
          <AddLocationAltIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </span>
    </Tooltip>
  );
}
