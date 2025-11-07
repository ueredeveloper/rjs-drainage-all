import React, { useState } from "react";
import './Converter.css';
import { UtmToDec, GmsToDec } from './ConverterUtils.js';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { Alert, TextField } from "@mui/material";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';


/**
 * @typedef {object} ConverterProps
 * @property {function(coords: {lat: number, lng: number}): void} setMapCoords -
 * Uma função de callback para definir as coordenadas decimais no mapa do componente pai.
 */

/**
 * Componente funcional para converter coordenadas entre diferentes formatos (UTM e GMS)
 * para o formato Decimal (WGS84) e exibi-las no mapa.
 *
 * @param {ConverterProps} props - As propriedades passadas para o componente.
 * @returns {React.ReactElement} O componente de interface do usuário do conversor.
 */
const Converter = ({ setMapCoords }) => {
  // --------------------------------------------------
  // ESTADOS DO COMPONENTE
  // --------------------------------------------------

  /**
   * Controla o modo de conversão ativo: 'utm' ou 'gms'.
   * @type {['utm'|'gms', React.Dispatch<React.SetStateAction<'utm'|'gms'>>]}
   */
  const [mode, setMode] = useState('utm');

  /**
   * Armazena os valores dos campos de entrada para o modo UTM.
   * @type {[object, React.Dispatch<React.SetStateAction<object>>]}
   * @property {string} easting - Coordenada Leste.
   * @property {string} northing - Coordenada Norte.
   * @property {string} zone - Zona UTM.
   * @property {'N'|'S'} hemisphere - Hemisfério (Norte ou Sul).
   */
  const [utmInputs, setUtmInputs] = useState({ easting: '', northing: '', zone: '', hemisphere: 'N' });

  /**
   * Armazena os valores dos campos de entrada para o modo GMS (Graus, Minutos, Segundos).
   * @type {[object, React.Dispatch<React.SetStateAction<object>>]}
   * @property {string} latDeg, latMin, latSec - Graus, minutos e segundos da Latitude.
   * @property {'N'|'S'} latDir - Direção da Latitude.
   * @property {string} lonDeg, lonMin, lonSec - Graus, minutos e segundos da Longitude.
   * @property {'L'|'O'} lonDir - Direção da Longitude.
   */
  const [gmsInputs, setGmsInputs] = useState({
    latDeg: '', latMin: '', latSec: '', latDir: 'N',
    lonDeg: '', lonMin: '', lonSec: '', lonDir: 'L'
  });

  /**
   * Armazena a string do resultado da conversão formatado para exibição.
   * @type {[string|null, React.Dispatch<React.SetStateAction<string|null>>]}
   */
  const [error, setError] = useState(null);

  // --------------------------------------------------
  // HANDLERS DE EVENTOS
  // --------------------------------------------------

  /**
   * Manipulador de mudança para os campos de entrada do modo UTM.
   * Atualiza o estado `utmInputs` mantendo os outros campos.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLSelectElement>} e - Evento de mudança do input.
   */
  const handleUtmChange = (e) => {
    const { name, value } = e.target;
    setUtmInputs(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Manipulador de mudança para os campos de entrada do modo GMS.
   * Atualiza o estado `gmsInputs` mantendo os outros campos.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLSelectElement>} e - Evento de mudança do input.
   */
  const handleGmsChange = (e) => {
    const { name, value } = e.target;
    setGmsInputs(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Executa a lógica de conversão baseada no `mode` atual.
   * Valida os inputs, chama a função utilitária de conversão e atualiza o estado
   * do componente pai (`setMapCoords`).
   */
  const handleConvert = () => {
    try {
      let coord;

      if (mode === 'utm') {
        const { easting, northing, zone, hemisphere } = utmInputs;

        // Validação básica para UTM
        if (!easting || !northing || !zone) {
          throw new Error("Preencha todos os campos UTM.");
        }

        // Conversão UTM para Decimal
        const res = UtmToDec({
          easting: Number(easting),
          northing: Number(northing),
          zone: Number(zone),
          hemisphere
        });
        coord = { lat: res.lat, lng: res.lon };

      } else { // mode === 'gms'
        const { latDeg, latMin, latSec, latDir, lonDeg, lonMin, lonSec, lonDir } = gmsInputs;

        // Validação básica para GMS
        if (!latDeg || !lonDeg) {
          throw new Error("Pelo menos os graus de latitude e longitude devem ser preenchidos.");
        }

        // Conversão GMS para Decimal. Valores vazios são tratados como 0.
        const lat = GmsToDec(Number(latDeg) || 0, Number(latMin) || 0, Number(latSec) || 0, latDir);
        const lon = GmsToDec(Number(lonDeg) || 0, Number(lonMin) || 0, Number(lonSec) || 0, lonDir);

        coord = { lat, lng: lon };
      }

      // 1. Atualiza as coordenadas no mapa (função passada pelo pai)
      setMapCoords(coord);
      // 2. Limpa qualquer erro anterior
      setError(null);

    } catch (err) {
      // Em caso de erro (validação ou na função utilitária)
      setError(err.message || " Erro na conversão!");
    }
  };

  /**
   * Altera o modo de conversão e limpa todos os estados de input e resultado
   * para preparar a interface para a nova conversão.
   *
   * @param {'utm'|'gms'} newMode - O novo modo de conversão a ser ativado.
   */
  const switchMode = (newMode) => {
    setMode(newMode);
    setError(null);
    // Reset dos inputs
    setUtmInputs({ easting: '', northing: '', zone: '', hemisphere: 'N' });
    setGmsInputs({
      latDeg: '', latMin: '', latSec: '', latDir: 'N',
      lonDeg: '', lonMin: '', lonSec: '', lonDir: 'L'
    });
  }

  // --------------------------------------------------
  // RENDERIZAÇÃO DA INTERFACE
  // --------------------------------------------------

  return (


    {/* Container de botões para alternar o modo */ },

    <Box component="section">

      {/*box de seleção de conversor*/}
      <Box component="section" sx={{textAlign: 'center'}}>

        <ButtonGroup variant="contained" aria-label="Basic button group">
          <Button onClick={() => switchMode('utm')} className={mode === 'utm' ? 'active' : ''}>UTM → Decimal</Button>
          <Button onClick={() => switchMode('gms')} className={mode === 'gms' ? 'active' : ''}>GMS → Decimal</Button>
        </ButtonGroup>

      </Box>

      {mode === 'utm' ? (
        /* Inputs para o modo UTM */
        <Box component="section" className="container" >
          <TextField className="textfield-clean" name="easting" label="Leste" variant="outlined" value={utmInputs.easting} onChange={handleUtmChange} type="number" />
          <TextField className="textfield-clean" name="northing" label="Norte" variant="outlined" value={utmInputs.northing} onChange={handleUtmChange} type="number" />
          <TextField className="textfield-clean" name="zone" label="Zona" variant="outlined"
            type="number"
            value={utmInputs.zone}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 1 && value <= 60) handleUtmChange(e);
            }}
            inputProps={{
              min: 1,
              max: 60,
              step: 1,
            }}
            sx={{
              width: 100,
              '& input': { textAlign: 'center' },
            }}
          />

          <Select
            name="hemisphere"
            className="input"
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={utmInputs.hemisphere}
            label="Age"
            onChange={handleUtmChange}
          >
            <MenuItem value="N">N</MenuItem>
            <MenuItem value="S">S</MenuItem>
          </Select>

        </Box>
      ) : (
        /* Inputs para o modo GMS */
        {/* Linha de Latitude */ },
        <Box component="section">

          <Box component="section" className="container">
            <Typography variant="body1" component="span">Lat:</Typography>
            <TextField className="textfield-clean" name="latDeg" label="Graus" variant="outlined" value={gmsInputs.latDeg} onChange={handleGmsChange} type="number" />
            <TextField className="textfield-clean" name="latMin" label="Minutos" variant="outlined" value={gmsInputs.latMin} onChange={handleGmsChange} type="number" />
            <TextField className="textfield-clean" name="latSec" label="Segundos" variant="outlined" value={gmsInputs.latSec} onChange={handleGmsChange} type="number" />
            <Select
              className="input"
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              name="latDir"
              value={gmsInputs.latDir}
              onChange={handleGmsChange}
            >
              <MenuItem value="N">N</MenuItem>
              <MenuItem value="S">S</MenuItem>
            </Select>

          </Box>

          {/* Linha de Longitude */}

          <Box component="section" className="container">
            <Typography variant="body1" component="span">Lon:</Typography>
            <TextField className="textfield-clean" name="lonDeg" label="Graus" variant="outlined" value={gmsInputs.lonDeg} onChange={handleGmsChange} type="number" />
            <TextField className="textfield-clean" name="lonMin" label="Minutos" variant="outlined" value={gmsInputs.lonMin} onChange={handleGmsChange} type="number" />
            <TextField className="textfield-clean" name="lonSec" label="Segundos" variant="outlined" value={gmsInputs.lonSec} onChange={handleGmsChange} type="number" />

            <Select
              className="input"
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              name="lonDir"
              value={gmsInputs.lonDir}
              onChange={handleGmsChange}
            >
              <MenuItem value="L">L</MenuItem>
              <MenuItem value="O">O</MenuItem>
            </Select>

          </Box>

        </Box>

      )}

      {/* Botão centralizado */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button variant="contained" onClick={handleConvert}>
          Converter
        </Button>
      </Box>

      <Typography sx={{ textAlign: 'right' }}>
        WGS84
      </Typography>

      {/* Mensagens de feedback */}

      {error && (
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      )}

    </Box>

  );
};

export default Converter;