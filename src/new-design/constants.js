import WaterDropIcon  from '@mui/icons-material/WaterDrop';
import WavesIcon       from '@mui/icons-material/Waves';
import AssessmentIcon  from '@mui/icons-material/Assessment';
import WaterIcon       from '@mui/icons-material/Water';

// ─── Auth: lê a sessão salva pelo login do site principal ─────────────────────
export const DEV_SESSION = localStorage.getItem('rjs_session');



// ─── Categorias de outorga ────────────────────────────────────────────────────
export const TI_CATS = [
  { key: 'superficial', label: 'Superficial', color: '#2e7d32', tiId: 1, Icon: WavesIcon },
  { key: 'subterranea', label: 'Subterrânea', color: '#0277bd', tiId: 2, Icon: WaterDropIcon },
  { key: 'pluvial',     label: 'Pluvial',      color: '#f57f17', tiId: 3, Icon: WaterIcon },
  { key: 'efluente',    label: 'Efluente',     color: '#6a1b9a', tiId: 4, Icon: AssessmentIcon },
  { key: 'barragem',    label: 'Barragem',     color: '#bf360c', tiId: 5, Icon: WaterIcon },
];

export const MAIN_TABS = [
  { label: 'Geral',       Icon: AssessmentIcon },
  { label: 'Subterrânea', Icon: WaterDropIcon  },
  { label: 'Superficial', Icon: WavesIcon      },
  { label: 'Barragem',    Icon: WaterIcon      },
];

export const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// ─── Abreviações para renderização em celular ─────────────────────────────────
export const ABBR = {
  'Geral':                    'GER',
  'Subterrânea':              'SUB',
  'Subterrâneo':              'SUB',
  'Subterrâneas':             'Subt.',
  'Superficial':              'SUP',
  'Barragem':                 'BAR',
  'Pluvial':                  'PLU',
  'Efluente':                 'EFL',
  'Efluentes':                'EFL',
  'Busca por Requerente':     'Req.',
  'Busca por Coordenadas':    'Coord.',
  'Distribuição':             'Dist.',
  'Coordenada':               'Coord.',
  'Manual / Tubular Raso':    'Man. / TR',
  'Tubular Profundo':         'TP',
  'Análise de disponibilidade': 'An. Disp.',
  'Outorgas subterrâneas':    'Subt.',
  'Q Explotável':             'Q Expl.',
  'Q Outorgada':              'Q Outorg.',
  'Q Disponível':             'Q Disp.',
  'Outorgas':                 'Out.',
  'Outorgada':                'Outorg.',
  'Disponível':               'Disp.',
  'Explotável':               'Expl.',
  'Bacia Hidrográfica':       'BH',
};

/** Retorna a abreviação do label em mobile, ou o label original em desktop. */
export const abbr = (label, isMobile) => isMobile ? (ABBR[label] ?? label) : label;

// ─── Dados de exemplo ─────────────────────────────────────────────────────────
export const MOCK_SUB = [
  { id: 1,  nome: 'Fazenda São José',    processo: '197.000.456/2021', volume: 850,  vazao: 2.3, municipio: 'Brasília' },
  { id: 3,  nome: 'Maria Santos',        processo: '197.001.234/2020', volume: 300,  vazao: 0.8, municipio: 'Gama' },
  { id: 6,  nome: 'João Ferreira',       processo: '197.004.123/2021', volume: 200,  vazao: 0.5, municipio: 'Taguatinga' },
  { id: 9,  nome: 'Ana Clara Rodrigues', processo: '197.007.012/2023', volume: 450,  vazao: 1.2, municipio: 'Ceilândia' },
  { id: 11, nome: 'Carlos Mendes',       processo: '197.009.678/2021', volume: 380,  vazao: 1.0, municipio: 'Samambaia' },
];

export const MOCK_SUP = [
  { id: 2,  nome: 'Condomínio Alphaville', processo: '197.000.789/2022', volume: 1200, vazao: 4.1,  municipio: 'Águas Claras' },
  { id: 5,  nome: 'Agrícola Cerrado',      processo: '197.003.890/2023', volume: 2800, vazao: 8.5,  municipio: 'Brazlândia' },
  { id: 7,  nome: 'Parque Aquático Norte', processo: '197.005.456/2022', volume: 4500, vazao: 15.2, municipio: 'Sobradinho' },
  { id: 10, nome: 'Irrigação Delta',       processo: '197.008.345/2020', volume: 6200, vazao: 22.0, municipio: 'Planaltina' },
  { id: 12, nome: 'Fazenda Rio Verde',     processo: '197.010.901/2019', volume: 3100, vazao: 9.8,  municipio: 'Brazlândia' },
];

export const VOLUMES_BARRAGEM = [
  { nome: 'Reservatório Alto', volTotal: '120,0', volUtil: '98,5',  cotaMax: '1.065,5', status: 'Normal' },
  { nome: 'Hidrelétrica Beta', volTotal:  '50,0', volUtil: '42,0',  cotaMax: '1.020,0', status: 'Atenção' },
];

export const DEMANDAS_BARRAGEM = [
  { processo: '197.002.567/2019', demandante: 'Hidrelétrica Beta', volume: '50.000',  periodo: '2019–2029', status: 'Ativo' },
  { processo: '197.006.789/2018', demandante: 'Reservatório Alto', volume: '120.000', periodo: '2018–2028', status: 'Ativo' },
];

export const MOCK_BAR = [
  { id: 4, nome: 'Hidrelétrica Beta', processo: '197.002.567/2019', volume: 50000,  vazao: 120.0, municipio: 'Planaltina' },
  { id: 8, nome: 'Reservatório Alto', processo: '197.006.789/2018', volume: 120000, vazao: 350.0, municipio: 'Paranoá' },
];
