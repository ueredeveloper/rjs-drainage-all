import React, { useState, useCallback, useEffect, useRef } from 'react';
import packageJson from '../../package.json';
import { Box, Typography, Tabs, Tab, Chip, Stack, Divider, IconButton, Button, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import WaterIcon from '@mui/icons-material/Water';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { Wrapper } from '@googlemaps/react-wrapper';
import LoginDialog from '../components/Commom/LoginDialog';
import { useAuth } from '../hooks/auth-hooks';

import './chartSetup'; // registra ChartJS globalmente (side-effect)
import './responsive.css';
import LeafletMap       from './LeafletMap';
import GoogleMapView    from './GoogleMapView';
import GeralTab         from './tabs/GeralTab';
import SubterraneanTab  from './tabs/SubterraneanTab';
import SuperficialTab   from './tabs/SuperficialTab';
import BarragemTab      from './tabs/BarragemTab';
import { findAllPointsInCircle, findAllPointsInPolygon, findAllPointsInRectangle } from '../services/geolocation';
import { findByColumn } from '../services/users';
import { TI_CATS, MAIN_TABS } from './constants';
import SettingsPanel, {
  FONT_SIZE_OPTIONS,
  FONT_SIZE_STORAGE_KEY,
  DEFAULT_FONT_SIZE,
  MAP_PROVIDER_STORAGE_KEY,
  DEFAULT_MAP_PROVIDER,
} from './components/SettingsPanel';
import { FontSizeProvider } from './FontSizeProvider';

const GMAPS_API_KEY = 'AIzaSyDELUXEV5kZ2MNn47NVRgCcDX-96Vtyj0w';

const MOBILE_TAB_LABELS = { 'Geral': 'GER', 'Subterrânea': 'SUB', 'Superficial': 'SUP', 'Barragem': 'BAR' };

export default function NewDesign() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { session, setLoginOpen } = useAuth();
  const userLabel = session?.colaborador?.email ? session.colaborador.email.split('@')[0] : null;
  const [tabIndex, setTabIndex]               = useState(0);
  const [lat, setLat]                         = useState('');
  const [lng, setLng]                         = useState('');
  const [radius, setRadius]                   = useState(1300);
  const [circleData, setCircleData]           = useState(null);
  const [searchResult, setSearchResult]       = useState(null);
  const [searchPages, setSearchPages]         = useState([]);
  const [selectedMarker, setSelectedMarker]   = useState(null);
  const [allMarkers, setAllMarkers]           = useState([]);
  const [hiddenCats, setHiddenCats]           = useState(new Set());
  const [searchHistory, setSearchHistory]     = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState(null);
  const [textLoading, setTextLoading]         = useState(false);
  const [textError, setTextError]             = useState(null);
  const [subShape, setSubShape]               = useState(null);
  const [userMarker, setUserMarker]           = useState(null);
  const [mapProvider, setMapProvider]         = useState(() => {
    try {
      const stored = localStorage.getItem(MAP_PROVIDER_STORAGE_KEY);
      return stored === 'leaflet' ? 'leaflet' : DEFAULT_MAP_PROVIDER;
    } catch {
      return DEFAULT_MAP_PROVIDER;
    }
  });
  const [persistedLayerState, setPersistedLayerState] = useState(null);
  const [clearShapesTrigger, setClearShapesTrigger] = useState(0);
  const [settingsOpen, setSettingsOpen]       = useState(false);
  const [mapExpanded, setMapExpanded]         = useState(false);
  const coordSearchPageIdRef                  = useRef(null);
  const skipUserMarkerEffectRef               = useRef(false);
  const [removeShapeTrigger, setRemoveShapeTrigger] = useState(null);
  const [lastDrawnPageId, setLastDrawnPageId] = useState(null);
  const [fontSize, setFontSize]               = useState(() => {
    try {
      const stored = parseInt(localStorage.getItem(FONT_SIZE_STORAGE_KEY), 10);
      return FONT_SIZE_OPTIONS.includes(stored) ? stored : DEFAULT_FONT_SIZE;
    } catch {
      return DEFAULT_FONT_SIZE;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(FONT_SIZE_STORAGE_KEY, String(fontSize));
    } catch { /* ignore */ }
  }, [fontSize]);

  useEffect(() => {
    try {
      localStorage.setItem(MAP_PROVIDER_STORAGE_KEY, mapProvider);
    } catch { /* ignore */ }
  }, [mapProvider]);

  const handleToggleCat = useCallback((key) => {
    setHiddenCats(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  // ── Normaliza as chaves da API para os nomes internos ────────────────────
  // A API retorna lancamento_efluentes / lancamento_pluviais; o resto do código
  // usa efluente / pluvial (via TI_CATS.key).
  const normalizeResult = useCallback((raw) => {
    if (!raw) return raw;
    return {
      ...raw,
      efluente: raw.efluente ?? raw.lancamento_efluentes ?? [],
      pluvial:  raw.pluvial  ?? raw.lancamento_pluviais  ?? [],
    };
  }, []);

  // ── Helpers pós-busca ─────────────────────────────────────────────────────
  const pushHistory = useCallback((data, shapeLabel, pageId) => {
    if (!data) return;
    setSearchPages(prev => [...prev, {
      id:    pageId,
      label: `P${prev.length + 1} — ${shapeLabel}`,
      data,
    }]);
    setSearchHistory(prev => [...prev, {
      id:     pageId,
      label:  `P${prev.length + 1} — ${shapeLabel}`,
      counts: TI_CATS.map(c => (Array.isArray(data[c.key]) ? data[c.key].length : 0)),
    }]);
  }, []);

  const updateAllMarkers = useCallback((data, pageId) => {
    if (!data) return;
    const newMarkers = TI_CATS.flatMap(c =>
      (Array.isArray(data[c.key]) ? data[c.key] : []).map(item => ({
        ...item, _catColor: c.color, _catLabel: c.label, _catKey: c.key, _pageId: pageId,
      }))
    ).filter(item => !isNaN(parseFloat(item.int_latitude)) && !isNaN(parseFloat(item.int_longitude)));
    setAllMarkers(prev => [...prev, ...newMarkers]);
  }, []);

  const handleClearPage = useCallback((id) => {
    if (coordSearchPageIdRef.current === id) coordSearchPageIdRef.current = null;
    setRemoveShapeTrigger({ pageId: id, ts: Date.now() });
    setSearchPages(prev =>
      prev.filter(p => p.id !== id).map((p, i) => ({ ...p, label: p.label.replace(/^P\d+/, `P${i + 1}`) }))
    );
    setAllMarkers(prev => prev.filter(m => m._pageId !== id));
  }, []);

  // ── Handlers de busca ─────────────────────────────────────────────────────
  const doCircleSearch = useCallback(async (center, rad, shapeLabel = 'Círculo', skipFly = false, replaceCoord = false, userDrawn = false) => {
    const oldPageId = replaceCoord ? coordSearchPageIdRef.current : null;
    const pageId = Date.now();
    if (replaceCoord) coordSearchPageIdRef.current = pageId;

    setCircleData({ center, radius: rad, _skipFly: skipFly, _replaceCoord: replaceCoord, _pageId: pageId, _userDrawn: userDrawn });
    setSubShape(null);
    setLoading(true);
    setError(null);

    if (oldPageId !== null) {
      setAllMarkers(prev => prev.filter(m => m._pageId !== oldPageId));
      setSearchPages(prev => {
        const filtered = prev.filter(p => p.id !== oldPageId);
        return filtered.map((p, i) => ({ ...p, label: p.label.replace(/^P\d+/, `P${i + 1}`) }));
      });
      setSearchHistory(prev => prev.filter(h => h.id !== oldPageId));
    }

    try {
      const data = normalizeResult(await findAllPointsInCircle({ center, radius: rad }));
      setSearchResult(data ?? {});
      pushHistory(data, shapeLabel, pageId);
      updateAllMarkers(data, pageId);
    } catch (err) {
      console.error('[círculo]', err);
      setError('Erro ao buscar outorgas. Verifique conexão ou autenticação.');
      setSearchResult({});
    } finally {
      setLoading(false);
    }
  }, [pushHistory, updateAllMarkers, normalizeResult]);

  useEffect(() => {
    if (skipUserMarkerEffectRef.current) { skipUserMarkerEffectRef.current = false; return; }
    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    if (!isNaN(latN) && !isNaN(lngN)) setUserMarker({ lat: latN, lng: lngN });
  }, [lat, lng]);

  const handleApplyCoordinates = useCallback(({ lat: latN, lng: lngN, info }) => {
    skipUserMarkerEffectRef.current = true;
    setLat(String(latN.toFixed(7)));
    setLng(String(lngN.toFixed(7)));
    setUserMarker({ lat: latN, lng: lngN, info: info ?? null });
  }, []);

  const handleCoordSearch = useCallback(() => {
    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    if (isNaN(latN) || isNaN(lngN)) { setError('Coordenadas inválidas. Ex: -15.7801'); return; }
    setUserMarker({ lat: latN, lng: lngN });
    doCircleSearch({ lat: latN, lng: lngN }, radius, 'Coordenada', false, true);
  }, [lat, lng, radius, doCircleSearch]);

  const handleSubSearch = useCallback(() => {
    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    if (isNaN(latN) || isNaN(lngN)) { setError('Coordenadas inválidas. Ex: -15.7801'); return; }
    doCircleSearch({ lat: latN, lng: lngN }, 2000, 'Subterrânea');
  }, [lat, lng, doCircleSearch]);

  const handleSupSearch = useCallback(() => {
    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    if (isNaN(latN) || isNaN(lngN)) { setError('Coordenadas inválidas. Ex: -15.7801'); return; }
    doCircleSearch({ lat: latN, lng: lngN }, 2000, 'Superficial');
  }, [lat, lng, doCircleSearch]);

  const handleSubMarkers = useCallback((points) => {
    if (!points || points.length === 0) { setAllMarkers([]); return; }
    const markers = points
      .filter(p => !isNaN(parseFloat(p.int_latitude)) && !isNaN(parseFloat(p.int_longitude)))
      .map(p => ({ ...p, _catColor: '#0277bd', _catLabel: 'Subterrânea', _catKey: 'subterranea' }));
    setAllMarkers(markers);
  }, []);

  const handleSupMarkers = useCallback((points) => {
    if (!points || points.length === 0) { setAllMarkers([]); return; }
    const markers = points
      .filter(p => !isNaN(parseFloat(p.int_latitude)) && !isNaN(parseFloat(p.int_longitude)))
      .map(p => ({ ...p, _catColor: '#2e7d32', _catLabel: 'Superficial', _catKey: 'superficial' }));
    setAllMarkers(markers);
  }, []);

  const handleBarMarkers = useCallback((points) => {
    if (!points || points.length === 0) { setAllMarkers([]); return; }
    const barCat = TI_CATS.find(c => c.key === 'barragem');
    const markers = points
      .filter(p => !isNaN(parseFloat(p.int_latitude)) && !isNaN(parseFloat(p.int_longitude)))
      .map(p => ({
        ...p,
        _catColor: barCat.color,
        _catLabel: barCat.label,
        _catKey: barCat.key,
        ti_id: p.ti_id ?? barCat.tiId,
      }));
    setAllMarkers(markers);
  }, []);

  const handleTextSearch = useCallback(async (query) => {
    setTextLoading(true);
    setTextError(null);
    const pageId = Date.now();
    try {
      const raw = await findByColumn(query);

      // A API pode retornar dois formatos distintos:
      // 1) [{subterranea:[...], superficial:[...], ...}]  — mesmo formato da busca geográfica
      // 2) [{...outorga}, {...outorga}, ...]               — array plano, categorizar por ti_id
      let categorized;
      if (Array.isArray(raw)) {
        const first = raw[0];
        const isCategorized = first && ('subterranea' in first || 'superficial' in first || 'barragem' in first);
        if (isCategorized) {
          categorized = first;
        } else {
          categorized = {
            superficial: raw.filter(o => String(o.ti_id) === '1'),
            subterranea: raw.filter(o => String(o.ti_id) === '2'),
            pluvial:     raw.filter(o => String(o.ti_id) === '3'),
            efluente:    raw.filter(o => String(o.ti_id) === '4'),
            barragem:    raw.filter(o => String(o.ti_id) === '5'),
          };
        }
      } else {
        categorized = raw ?? {};
      }

      const data = normalizeResult(categorized);
      setSearchResult(data ?? {});
      pushHistory(data, 'Texto', pageId);
      updateAllMarkers(data, pageId);
    } catch (err) {
      console.error('[texto]', err);
      setTextError('Erro ao buscar por dados do requerente.');
      setSearchResult({});
    } finally {
      setTextLoading(false);
    }
  }, [normalizeResult, pushHistory, updateAllMarkers]);

  
  const handleClearAll = useCallback(() => {
    coordSearchPageIdRef.current = null;
    setCircleData(null);
    setUserMarker(null);
    setSubShape(null);
    setAllMarkers([]);
    setSearchResult(null);
    setSearchPages([]);
    setSearchHistory([]);
    setSelectedMarker(null);
    setError(null);
    setClearShapesTrigger(prev => prev + 1);
  }, []);

  const handleEditSave = useCallback(() => {
    setAllMarkers([]);
    setSearchPages([]);
    setSearchHistory([]);
    setSearchResult(null);
  }, []);

  const handlePickCoordinate = useCallback(({ lat: pLat, lng: pLng }) => {
    setLat(pLat.toFixed(6));
    setLng(pLng.toFixed(6));
    setUserMarker({ lat: pLat, lng: pLng });
  }, []);

  const handleInitialMarker = useCallback(({ lat: iLat, lng: iLng }) => {
    setLat(iLat.toFixed(6));
    setLng(iLng.toFixed(6));
  }, []);

  const handleMapShape = useCallback(async (shape) => {
    if (shape.type === 'circle') {
      setLat(shape.center.lat.toFixed(6));
      setLng(shape.center.lng.toFixed(6));
      doCircleSearch(shape.center, shape.radius, 'Círculo', true, false, true);
      return;
    }

    setCircleData(null);
    setLoading(true);
    setError(null);
    setTabIndex(0);
    const pageId = Date.now();
    setLastDrawnPageId({ pageId, ts: pageId });

    try {
      let data;
      if (shape.type === 'rectangle') {
        data = normalizeResult(await findAllPointsInRectangle(shape.nex, shape.ney, shape.swx, shape.swy));
        pushHistory(data, 'Retângulo', pageId);
      } else if (shape.type === 'polygon') {
        data = normalizeResult(await findAllPointsInPolygon(shape.points));
        pushHistory(data, 'Polígono', pageId);
      }
      setSearchResult(data ?? {});
      updateAllMarkers(data, pageId);
    } catch (err) {
      console.error('[forma]', err);
      setError('Erro ao buscar dentro da forma desenhada.');
      setSearchResult({});
    } finally {
      setLoading(false);
    }
  }, [doCircleSearch, normalizeResult, pushHistory, updateAllMarkers]);

  const totalResults = searchPages.reduce(
    (sum, page) => sum + Object.values(page.data).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0),
    0
  );

  return (
    <FontSizeProvider fontSize={fontSize}>
    <Wrapper apiKey={GMAPS_API_KEY} libraries={['drawing', 'geometry', 'marker']}>
    <Box
      id="nd-root"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        fontFamily: 'Roboto, sans-serif',
      }}
    >

      {/* ── Cabeçalho ────────────────────────────────────────────────────── */}
      <Box id="nd-header" sx={{ display: 'flex', alignItems: 'center', px: { xs: 1, sm: 2 }, py: { xs: 0.6, sm: 0.9 }, bgcolor: '#003566', color: '#fff', gap: { xs: 1, sm: 1.5 }, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.35)', zIndex: 10 }}>
        <WaterIcon sx={{ color: '#48cae4', fontSize: 22 }} />

        {/* SAD/DF — expande ao hover */}
        <Box sx={{ overflow: 'hidden', maxWidth: 320, '&:hover .slide-hidden': { maxWidth: 260, opacity: 1 } }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ whiteSpace: 'nowrap' }}>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.88rem' }, letterSpacing: 0.6, flexShrink: 0 }}>
              SAD/DF
            </Typography>
            <Box className="slide-hidden" sx={{ maxWidth: 0, opacity: 0, overflow: 'hidden', transition: 'max-width 0.4s ease, opacity 0.35s ease', display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.8 }}>
              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.35)', height: 14, alignSelf: 'center' }} />
              <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.3 }}>
                Sistema de Apoio à Decisão — SRH/COUT
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ flex: 1 }} />
        {searchPages.length > 0 && (
          <Chip label={`${totalResults} outorga${totalResults !== 1 ? 's' : ''}`}
            size="small" sx={{ bgcolor: '#48cae430', color: '#90e0ef', fontSize: '0.62rem', height: 20 }} />
        )}
        <Tooltip title={session?.colaborador?.email ?? 'Fazer login'}>
          <Button
            size="small"
            onClick={() => setLoginOpen(true)}
            startIcon={<AccountCircleIcon sx={{ fontSize: 17 }} />}
            sx={{
              color: userLabel ? '#48cae4' : 'rgba(255,255,255,0.65)',
              fontSize: { xs: '0.62rem', sm: '0.7rem' },
              textTransform: 'none',
              fontWeight: userLabel ? 700 : 400,
              minWidth: 'auto',
              px: { xs: 0.6, sm: 1 },
              py: 0.4,
              '&:hover': { bgcolor: 'rgba(72,202,228,0.15)', color: '#fff' },
            }}
          >
            {userLabel ?? 'Login'}
          </Button>
        </Tooltip>
        <IconButton
          onClick={() => setSettingsOpen(true)}
          size="small"
          aria-label="Abrir configurações"
          sx={{
            color: '#90e0ef',
            ml: 0.5,
            '&:hover': { bgcolor: 'rgba(72, 202, 228, 0.15)', color: '#fff' },
          }}
        >
          <SettingsIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* ── Corpo ─────────────────────────────────────────────────────────── */}
      <Box id="nd-body" sx={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: { xs: 'column', md: 'row' } }}>

        {/* Mapa */}
        <Box id="nd-map-panel" sx={{
          width:    { xs: mapExpanded ? '100vw' : '100%',  md: mapExpanded ? '100vw' : '25%' },
          height:   { xs: mapExpanded ? '100vh' : '42vh',  md: 'auto' },
          position: { xs: mapExpanded ? 'fixed' : 'relative', md: 'relative' },
          top:      { xs: mapExpanded ? 0 : 'auto',        md: 'auto' },
          left:     { xs: mapExpanded ? 0 : 'auto',        md: 'auto' },
          zIndex:   { xs: mapExpanded ? 9999 : 'auto',     md: 'auto' },
          flexShrink: 0,
        }}>
          {(() => {
            const mapProps = {
              introReady: !!session,
              circleData,
              onShapeCreated: handleMapShape,
              onLayerFeatureSearch: handleMapShape,
              markerData: selectedMarker,
              userMarker,
              onPickCoordinate: handlePickCoordinate,
              onInitialMarker: handleInitialMarker,
              onClearAll: handleClearAll,
              onEditSave: handleEditSave,
              allMarkers: hiddenCats.size === 0 ? allMarkers : allMarkers.filter(m => !hiddenCats.has(m._catKey)),
              subShape,
              clearShapesTrigger,
              initialLayerState: persistedLayerState,
              onLayerStateChange: setPersistedLayerState,
              lastDrawnPageId,
              removeShapeTrigger,
            };
            return mapProvider === 'gmaps'
              ? <GoogleMapView {...mapProps} />
              : <LeafletMap    {...mapProps} />;
          })()}

          {/* Botão fullscreen customizado — visível apenas em mobile */}
          <Tooltip title={mapExpanded ? 'Sair do fullscreen' : 'Fullscreen'}>
            <IconButton
              onClick={() => setMapExpanded(v => !v)}
              size="small"
              sx={{
                display: { xs: 'flex', md: 'none' },
                position: 'absolute', top: 8, right: 8, zIndex: 900,
                bgcolor: 'rgba(255,255,255,0.92)', boxShadow: '0 1px 5px rgba(0,0,0,0.35)',
                p: 0.5, '&:hover': { bgcolor: '#fff' },
              }}
            >
              {mapExpanded
                ? <FullscreenExitIcon sx={{ fontSize: 20 }} />
                : <FullscreenIcon    sx={{ fontSize: 20 }} />}
            </IconButton>
          </Tooltip>

          {/* Toggle de provedor */}
          <Box id="nd-map-provider-toggle" sx={{
            position: 'absolute', bottom: 10, left: 10,
            zIndex: 800, display: 'flex', borderRadius: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.28)', overflow: 'hidden',
            border: '1.5px solid #1565c0',
          }}>
            {[{ value: 'gmaps', label: 'G Maps' }, { value: 'leaflet', label: 'Leaflet' }].map(({ value, label }) => (
              <Box
                key={value}
                component="button"
                onClick={() => setMapProvider(value)}
                sx={{
                  px: { xs: 0.8, sm: 1.6 }, py: { xs: 0.3, sm: 0.55 },
                  fontSize: { xs: '0.55rem', sm: '0.68rem' }, fontWeight: mapProvider === value ? 700 : 500,
                  lineHeight: 1.4, cursor: 'pointer', border: 'none', outline: 'none',
                  bgcolor: mapProvider === value ? '#1565c0' : '#fff',
                  color:   mapProvider === value ? '#fff'    : '#1565c0',
                  transition: 'background 0.18s, color 0.18s',
                  '&:hover': { bgcolor: mapProvider === value ? '#1565c0' : '#e3f2fd' },
                  userSelect: 'none', whiteSpace: 'nowrap',
                }}
              >
                {label}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Painel de análise */}
        <Box id="nd-analysis-panel" sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#fff', borderLeft: '1px solid #e0e0e0', overflow: 'hidden' }}>

          {/* Abas principais */}
          <Box id="nd-main-tabs" sx={{ borderBottom: '1px solid #e0e0e0', flexShrink: 0 }}>
            <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} variant="fullWidth"
              sx={{
                minHeight: 42,
                '& .MuiTab-root': { minHeight: 42, fontSize: '0.71rem', textTransform: 'none', fontWeight: 500, py: 0 },
                '& .Mui-selected': { fontWeight: 700 },
                '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
              }}
            >
              {MAIN_TABS.map(({ label, Icon }) => (
                <Tab key={label} label={
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Icon sx={{ fontSize: 14 }} />
                    <span>{isMobile ? (MOBILE_TAB_LABELS[label] ?? label) : label}</span>
                  </Stack>
                } />
              ))}
            </Tabs>
          </Box>

          {/* Conteúdo das abas — todos mantidos montados para preservar estado */}
          <Box sx={{ display: tabIndex === 0 ? 'flex' : 'none', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
            <GeralTab
              lat={lat} lng={lng}
              onLatChange={setLat} onLngChange={setLng}
              onApplyCoordinates={handleApplyCoordinates}
              radius={radius} onRadiusChange={setRadius}
              onSearch={handleCoordSearch}
              onTextSearch={handleTextSearch}
              loading={loading}
              error={error}
              textLoading={textLoading}
              textError={textError}
              searchResult={searchResult}
              searchPages={searchPages}
              onClearPage={handleClearPage}
              onClearAll={handleClearAll}
              onMarkerSelect={setSelectedMarker}
              searchHistory={searchHistory}
              hiddenCats={hiddenCats}
              onToggleCat={handleToggleCat}
            />
          </Box>
          <Box sx={{ display: tabIndex === 1 ? 'flex' : 'none', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
            <SubterraneanTab
              lat={lat} lng={lng} onLatChange={setLat} onLngChange={setLng}
              onApplyCoordinates={handleApplyCoordinates}
              onMarkerSelect={setSelectedMarker}
              onSubShape={setSubShape}
              onSubMarkers={handleSubMarkers}
              onClearCircle={() => setCircleData(null)}
            />
          </Box>
          <Box sx={{ display: tabIndex === 2 ? 'flex' : 'none', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
            <SuperficialTab
              lat={lat} lng={lng} onLatChange={setLat} onLngChange={setLng}
              onApplyCoordinates={handleApplyCoordinates}
              onMarkerSelect={setSelectedMarker}
              onSupShape={setSubShape}
              onSupMarkers={handleSupMarkers}
              onClearCircle={() => setCircleData(null)}
            />
          </Box>
          <Box sx={{ display: tabIndex === 3 ? 'flex' : 'none', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
            <BarragemTab
              lat={lat} lng={lng} onLatChange={setLat} onLngChange={setLng}
              onApplyCoordinates={handleApplyCoordinates}
              onMarkerSelect={setSelectedMarker}
              onBarMarkers={handleBarMarkers}
              onBarShape={setSubShape}
              onClearCircle={() => setCircleData(null)}
            />
          </Box>
        </Box>
      </Box>

      {/* ── Rodapé ────────────────────────────────────────────────────────── */}
      <Box id="nd-footer" sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 0.6, bgcolor: '#f0f4f8', borderTop: '1px solid #dde3ea', flexShrink: 0 }}>
        <Typography sx={{ fontSize: '0.62rem', color: '#78909c', letterSpacing: 0.3 }}>
          Superintendência de Outorga — COUT — SRH
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography
            component="a"
            href="mailto:outorga@adasa.df.gov.br"
            sx={{ fontSize: '0.62rem', color: '#546e7a', textDecoration: 'none', '&:hover': { color: '#003566', textDecoration: 'underline' } }}
          >
            outorga@adasa.df.gov.br
          </Typography>
          <Typography sx={{ fontSize: '0.62rem', color: '#b0bec5', userSelect: 'none' }}>|</Typography>
          <Typography sx={{ fontSize: '0.62rem', color: '#90a4ae', letterSpacing: 0.4 }}>
            v{packageJson.version}
          </Typography>
        </Stack>
      </Box>
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        mapProvider={mapProvider}
        onMapProviderChange={setMapProvider}
      />
      <LoginDialog />
    </Box>
    </Wrapper>
    </FontSizeProvider>
  );
}
