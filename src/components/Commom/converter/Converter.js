import React, { useState } from "react";
import './Converter.css';
import { UtmToDec, GmsToDec } from './ConverterUtils.js';

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
    <div id="converter">
      <h1>WGS84</h1>

      {/* Container de botões para alternar o modo */}
      <div id="btn-container">
        <button
          onClick={() => switchMode('utm')}
          className={mode === 'utm' ? 'active' : ''}
        >
          UTM → Decimal
        </button>
        <button
          onClick={() => switchMode('gms')}
          className={mode === 'gms' ? 'active' : ''}
        >
          GMS → Decimal
        </button>
      </div>

      {/* Container principal dos campos de entrada */}
      <div id="input-container">
        {mode === 'utm' ? (
          /* Inputs para o modo UTM */
          <div className="utm-inputs">
            <input name="easting" placeholder="Leste" value={utmInputs.easting} onChange={handleUtmChange} type="number" />
            <input name="northing" placeholder="Norte" value={utmInputs.northing} onChange={handleUtmChange} type="number" />
            <input name="zone" placeholder="Zona" value={utmInputs.zone} onChange={handleUtmChange} type="number" />
            <select name="hemisphere" value={utmInputs.hemisphere} onChange={handleUtmChange}>
              <option value="N">N</option>
              <option value="S">S</option>
            </select>
          </div>
        ) : (
          /* Inputs para o modo GMS */
          <div className="gms-inputs">
            {/* Linha de Latitude */}
            <div className="gms-row">
              <span>Lat:</span>
              <input name="latDeg" placeholder="Graus" value={gmsInputs.latDeg} onChange={handleGmsChange} type="number"/>
              <input name="latMin" placeholder="Minutos" value={gmsInputs.latMin} onChange={handleGmsChange} type="number" />
              <input name="latSec" placeholder="Seg" value={gmsInputs.latSec} onChange={handleGmsChange} type="number" />
              <select name="latDir" value={gmsInputs.latDir} onChange={handleGmsChange}>
                <option value="N">N</option>
                <option value="S">S</option>
              </select>
            </div>
            {/* Linha de Longitude */}
            <div className="gms-row">
              <span>Lon:</span>
              <input name="lonDeg" placeholder="Graus" value={gmsInputs.lonDeg} onChange={handleGmsChange} type="number" />
              <input name="lonMin" placeholder="Min" value={gmsInputs.lonMin} onChange={handleGmsChange} type="number" />
              <input name="lonSec" placeholder="Seg" value={gmsInputs.lonSec} onChange={handleGmsChange} type="number" />
              <select name="lonDir" value={gmsInputs.lonDir} onChange={handleGmsChange}>
                <option value="L">L</option>
                <option value="O">O</option>
              </select>
            </div>
          </div>
        )}
        <button onClick={handleConvert}>Converter</button>
      </div>

      {/* Mensagens de feedback */}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Converter;