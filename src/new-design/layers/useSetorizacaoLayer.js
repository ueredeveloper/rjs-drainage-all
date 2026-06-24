import { useEffect } from 'react';
import geoJson from './setorizacao-geometrias.json';
import selecao from '../../assets/geojson/setorizacao-selecao.json';
import { toPoints } from './geoUtils';

const PALETTE = [
  '#F44336', '#E91E63', '#9C27B0', '#3F51B5',
  '#2196F3', '#00BCD4', '#009688', '#4CAF50',
  '#CDDC39', '#FF9800', '#FF5722', '#78909C',
];

const SECTORS = (() => {
  const data = [
    { key: 'setz_avpr_1',          sigla: 'AVPR 1',           nome: 'Área Verde de Proteção e Reserva 1' },
    { key: 'setz_avpr_2',          sigla: 'AVPR 2',           nome: 'Área Verde de Proteção e Reserva 2' },
    { key: 'setz_cand',            sigla: 'CAND',             nome: 'Candangolândia' },
    { key: 'setz_ces',             sigla: 'CES',              nome: 'Cemitério Sul' },
    { key: 'setz_emi',             sigla: 'EMI',              nome: 'Esplanada dos Ministérios' },
    { key: 'setz_emo',             sigla: 'EMO',              nome: 'Eixo Monumental Oeste' },
    { key: 'setz_ern',             sigla: 'ERN',              nome: 'Eixo Rodoviário-Residencial Norte' },
    { key: 'setz_ers',             sigla: 'ERS',              nome: 'Eixo Rodoviário-Residencial Sul' },
    { key: 'setz_eto',             sigla: 'ETO',              nome: 'Esplanada da Torre de TV' },
    { key: 'setz_lago_parano',     sigla: 'LAGO PARANOÁ',     nome: 'Lago Paranoá' },
    { key: 'setz_pfr',             sigla: 'PFR',              nome: 'Plataforma Rodoviária' },
    { key: 'setz_pmu',             sigla: 'PMU',              nome: 'Praça Municipal' },
    { key: 'setz_pqeb',            sigla: 'PQEB',             nome: 'Parque Estação Biológica' },
    { key: 'setz_pqen',            sigla: 'PQEN',             nome: 'Parque Ecológico Norte' },
    { key: 'setz_ptp',             sigla: 'PTP',              nome: 'Praça dos Três Poderes' },
    { key: 'setz_safn',            sigla: 'SAFN',             nome: 'Adm. Federal Norte' },
    { key: 'setz_safs',            sigla: 'SAFS',             nome: 'Adm. Federal Sul' },
    { key: 'setz_sam',             sigla: 'SAM',              nome: 'Adm. Municipal' },
    { key: 'setz_saun',            sigla: 'SAUN',             nome: 'Autarquias Norte' },
    { key: 'setz_saus',            sigla: 'SAUS',             nome: 'Autarquias Sul' },
    { key: 'setz_sbn',             sigla: 'SBN',              nome: 'Bancário Norte' },
    { key: 'setz_sbs',             sigla: 'SBS',              nome: 'Bancário Sul' },
    { key: 'setz_scen',            sigla: 'SCEN',             nome: 'Clubes Esportivos Norte' },
    { key: 'setz_sces',            sigla: 'SCES',             nome: 'Clubes Esportivos Sul' },
    { key: 'setz_sclrn',           sigla: 'SCLRN',            nome: 'Comercial Local Residencial Norte' },
    { key: 'setz_scn',             sigla: 'SCN',              nome: 'Comercial Norte' },
    { key: 'setz_scrn',            sigla: 'SCRN',             nome: 'Comercial Residencial Norte' },
    { key: 'setz_scrs',            sigla: 'SCRS',             nome: 'Comercial Residencial Sul' },
    { key: 'setz_scs',             sigla: 'SCS',              nome: 'Comercial Sul' },
    { key: 'setz_sctn',            sigla: 'SCTN',             nome: 'Cultural Norte' },
    { key: 'setz_scts',            sigla: 'SCTS',             nome: 'Cultural Sul' },
    { key: 'setz_sdc',             sigla: 'SDC',              nome: 'Divulgação Cultural' },
    { key: 'setz_sdn',             sigla: 'SDN',              nome: 'Diversões Norte' },
    { key: 'setz_sds',             sigla: 'SDS',              nome: 'Diversões Sul' },
    { key: 'setz_sen',             sigla: 'SEN',              nome: 'Embaixadas Norte' },
    { key: 'setz_sepn',            sigla: 'SEPN',             nome: 'Edifícios Utilidade Pública Norte' },
    { key: 'setz_seps',            sigla: 'SEPS',             nome: 'Edifícios Utilidade Pública Sul' },
    { key: 'setz_ses',             sigla: 'SES',              nome: 'Embaixadas Sul' },
    { key: 'setz_sgan',            sigla: 'SGAN',             nome: 'Grandes Áreas Norte' },
    { key: 'setz_sgas',            sigla: 'SGAS',             nome: 'Grandes Áreas Sul' },
    { key: 'setz_sgmn',            sigla: 'SGMN',             nome: 'Garagens Ministérios Norte' },
    { key: 'setz_sgo',             sigla: 'SGO',              nome: 'Garagens Oficiais' },
    { key: 'setz_shcao',           sigla: 'SHCAO',            nome: 'Hab. Coletivas Octogonais' },
    { key: 'setz_shces',           sigla: 'SHCES',            nome: 'Hab. Coletivas Econ. Sul' },
    { key: 'setz_shcgn',           sigla: 'SHCGN',            nome: 'Hab. Coletivas Geminadas Norte' },
    { key: 'setz_shcn',            sigla: 'SHCN',             nome: 'Hab. Coletivas Norte' },
    { key: 'setz_shcnw',           sigla: 'SHCNW',            nome: 'Hab. Coletivas Noroeste' },
    { key: 'setz_shcs',            sigla: 'SHCS',             nome: 'Hab. Coletivas Sul' },
    { key: 'setz_shcsw',           sigla: 'SHCSW',            nome: 'Hab. Coletivas Sudoeste' },
    { key: 'setz_shigs',           sigla: 'SHIGS',            nome: 'Hab. Individuais Geminadas Sul' },
    { key: 'setz_ship',            sigla: 'SHIP',             nome: 'Setor Hípico' },
    { key: 'setz_shln',            sigla: 'SHLN',             nome: 'Hospitalar Local Norte' },
    { key: 'setz_shls',            sigla: 'SHLS',             nome: 'Hospitalar Local Sul' },
    { key: 'setz_shlsw',           sigla: 'SHLSW',            nome: 'Hospitalar Local Sudoeste' },
    { key: 'setz_shn',             sigla: 'SHN',              nome: 'Hoteleiro Norte' },
    { key: 'setz_shs',             sigla: 'SHS',              nome: 'Hoteleiro Sul' },
    { key: 'setz_shtn',            sigla: 'SHTN',             nome: 'Hotéis de Turismo Norte' },
    { key: 'setz_sig',             sigla: 'SIG',              nome: 'Indústrias Gráficas' },
    { key: 'setz_smas',            sigla: 'SMAS',             nome: 'Múltiplas Atividades Sul' },
    { key: 'setz_smhn',            sigla: 'SMHN',             nome: 'Médico-Hospitalar Norte' },
    { key: 'setz_smhs',            sigla: 'SMHS',             nome: 'Médico-Hospitalar Sul' },
    { key: 'setz_smin',            sigla: 'SMIN',             nome: 'Mansões Isoladas Norte' },
    { key: 'setz_smu',             sigla: 'SMU',              nome: 'Militar Urbano' },
    { key: 'setz_spo',             sigla: 'SPO',              nome: 'Setor Policial' },
    { key: 'setz_spp',             sigla: 'SPP',              nome: 'Palácio Presidencial' },
    { key: 'setz_spvp',            sigla: 'SPVP',             nome: 'Preservação Vila Planalto' },
    { key: 'setz_sres',            sigla: 'SRES',             nome: 'Residências Econômicas Sul' },
    { key: 'setz_srpn',            sigla: 'SRPN',             nome: 'Recreação Pública Norte' },
    { key: 'setz_srps',            sigla: 'SRPS',             nome: 'Recreação Pública Sul' },
    { key: 'setz_srtvn',           sigla: 'SRTVN',            nome: 'Rádio e TV Norte' },
    { key: 'setz_srtvs',           sigla: 'SRTVS',            nome: 'Rádio e TV Sul' },
    { key: 'setz_stn',             sigla: 'STN',              nome: 'Terminal Norte' },
    { key: 'setz_sts',             sigla: 'STS',              nome: 'Terminal Sul' },
    { key: 'setz_unb',             sigla: 'UnB',              nome: 'Universidade de Brasília' },
    { key: 'setz_vila_telebraslia', sigla: 'VILA TELEBRASÍLIA', nome: 'Vila Telebrasília' },
    { key: 'setz_vpla',            sigla: 'VPLA',             nome: 'Vila Planalto' },
    { key: 'setz_zoo_arie',        sigla: 'ZOO/ARIE',         nome: 'Zoológico / ARIE' },
  ];
  return data.map((s, i) => ({ ...s, color: PALETTE[i % PALETTE.length], delay: 200 + i * 35 }));
})();

export const SETZ_BY_KEY = Object.fromEntries(SECTORS.map(s => [s.key, s]));

const DEFAULT_VISIBLE = new Set(selecao.selectedKeys);

export function useSetorizacaoLayer(mapInstance, setzLayersRef) {
  useEffect(() => {
    if (!mapInstance) return;
    const DRAW_MS = 3500, TICK_MS = 16;
    const rawFeats = geoJson.features || [];
    const featureMap = {};
    SECTORS.forEach(s => { featureMap[s.key] = rawFeats.filter(f => f.properties.sigla === s.sigla); });
    const polylines = [], timers = [], intervals = [];
    SECTORS.forEach(sector => {
      if (!DEFAULT_VISIBLE.has(sector.key)) return;
      const { key, color, delay } = sector;
      const points = toPoints(featureMap[key] || []);
      if (!points.length) return;
      timers.push(setTimeout(() => {
        const line = new window.google.maps.Polyline({ path: [], map: mapInstance, strokeColor: color, strokeWeight: 1.8, strokeOpacity: 0.9, clickable: false });
        polylines.push(line);
        const path = line.getPath();
        const batchSize = Math.max(1, Math.ceil(points.length / (DRAW_MS / TICK_MS)));
        let idx = 0;
        const iv = setInterval(() => {
          const end = Math.min(idx + batchSize, points.length);
          for (; idx < end; idx++) path.push(new window.google.maps.LatLng(points[idx].lat, points[idx].lng));
          if (idx >= points.length) {
            clearInterval(iv); line.setMap(null);
            const layer = new window.google.maps.Data({ map: mapInstance });
            layer.addGeoJson({ type: 'FeatureCollection', features: featureMap[key] });
            layer.setStyle({ fillColor: color, fillOpacity: 0.22, strokeColor: color, strokeWeight: 1.5, strokeOpacity: 0.85 });
            setzLayersRef.current[key] = layer;
          }
        }, TICK_MS);
        intervals.push(iv);
      }, delay));
    });
    return () => {
      timers.forEach(clearTimeout); intervals.forEach(clearInterval);
      polylines.forEach(l => { try { l.setMap(null); } catch (_) {} });
      Object.values(setzLayersRef.current).forEach(l => { try { l.setMap(null); } catch (_) {} });
      setzLayersRef.current = {};
    };
  }, [mapInstance]);
}
