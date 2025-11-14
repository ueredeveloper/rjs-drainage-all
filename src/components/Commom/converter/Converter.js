/**
 * Componente de conversão de coordenadas UTM/GMS para Decimal.
 * Permite alternar entre abas e enviar as coordenadas convertidas para o mapa.
 *
 * @component
 * @param {Object} props
 * @param {(coords: {lat: number, lng: number}) => void} props.setMapCoords - Função usada para atualizar o mapa com as coordenadas convertidas.
 */

import React, { useState } from "react";
import {
  UtmToDec,
  GmsToDec,
} from "../../../tools/ConverterCoordinatesTools.js";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Alert,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Tooltip,
} from "@mui/material";
import CachedIcon from "@mui/icons-material/Cached";

/**
 * @typedef {object} ConverterProps
 * @property {function(coords: {lat: number, lng: number}): void} setMapCoords
 */
export default function Converter({ setMapCoords }) {
  /**
   * Aba ativa do conversor (0 = UTM, 1 = GMS)
   * @type {[number, function]}
   */
  const [tabValue, setTabValue] = useState(0);

  /**
   * Campos para entrada UTM
   * @type {[{easting: string, northing: string, zone: string, hemisphere: "N"|"S"}, function]}
   */
  const [utmInputs, setUtmInputs] = useState({
    easting: "",
    northing: "",
    zone: "22",
    hemisphere: "S",
  });

  /**
   * Campos para entrada GMS (Graus, Minutos, Segundos)
   * @type {[{latDeg: string, latMin: string, latSec: string, latDir: string, lonDeg: string, lonMin: string, lonSec: string, lonDir: string}, function]}
   */
  const [gmsInputs, setGmsInputs] = useState({
    latDeg: "",
    latMin: "",
    latSec: "",
    latDir: "N",
    lonDeg: "",
    lonMin: "",
    lonSec: "",
    lonDir: "L",
  });

  /**
   * Estado de erro (mensagem exibida ao usuário)
   * @type {[string|null, function]}
   */
  const [error, setError] = useState(null);

  /** @type {object} Estilização aplicada aos TextFields */
  const textFieldStyles = {
    width: "10vw",
    backgroundColor: "transparent",
    "& .MuiInputLabel-root": {
      fontSize: "0.9rem",
      color: "#666",
    },
    "& .MuiInputLabel-root.MuiInputLabel-shrink": {
      fontSize: "0.7rem",
      color: "#555",
    },
    "& .MuiOutlinedInput-root": {
      paddingRight: 0,
      "& fieldset": {
        borderColor: "#999",
      },
      "&:hover fieldset": {
        borderColor: "#555",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#1976d2",
        borderWidth: "2px",
      },
    },
    "& .MuiInputBase-input": {
      padding: "0.45rem 0.6rem",
      fontSize: "0.95rem",
      color: "#222",
    },
    "& .MuiSvgIcon-root": {
      fontSize: "1.1rem",
      color: "#777",
    },
  };

  /** @type {object} Estilização aplicada aos Select */
  const selectStyles = {
    backgroundColor: "transparent",
    textAlign: "center",
    height: "4vh",
    width: "5.2vw",
  };

  /**
   * Troca a aba ativa do componente
   * @param {React.SyntheticEvent} event
   * @param {number} newValue
   */
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError(null);
  };

  /**
   * Atualiza valores do formulário UTM
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>} e
   */
  const handleUtmChange = (e) => {
    const { name, value } = e.target;
    setUtmInputs((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Atualiza valores do formulário GMS
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>} e
   */
  const handleGmsChange = (e) => {
    const { name, value } = e.target;
    setGmsInputs((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Botão reutilizável com tooltip e ícone de converter
   * @returns {JSX.Element}
   */
  const BtnConverter = () => (
    <Button variant="contained" onClick={handleConvert}>
      <Tooltip title="converter">
        <CachedIcon />
      </Tooltip>
    </Button>
  );

  /**
   * Converte as coordenadas da aba ativa (UTM ou GMS) para Decimal.
   * Atualiza o mapa através de setMapCoords.
   */
  const handleConvert = () => {
    try {
      let coord;

      // Conversão UTM
      if (tabValue === 0) {
        const { easting, northing, zone, hemisphere } = utmInputs;
        if (!easting || !northing || !zone)
          throw new Error("Preencha todos os campos UTM.");

        const res = UtmToDec({
          easting: Number(easting),
          northing: Number(northing),
          zone: Number(zone),
          hemisphere,
        });

        coord = { lat: res.lat, lng: res.lon };
      } else {
        // Conversão GMS
        const {
          latDeg,
          latMin,
          latSec,
          latDir,
          lonDeg,
          lonMin,
          lonSec,
          lonDir,
        } = gmsInputs;

        if (!latDeg || !lonDeg)
          throw new Error("Preencha pelo menos os graus de latitude e longitude.");

        const lat = GmsToDec(
          Number(latDeg) || 0,
          Number(latMin) || 0,
          Number(latSec) || 0,
          latDir
        );

        const lon = GmsToDec(
          Number(lonDeg) || 0,
          Number(lonMin) || 0,
          Number(lonSec) || 0,
          lonDir
        );

        coord = { lat, lng: lon };
      }

      setMapCoords(coord);
      setError(null);
    } catch (err) {
      setError(err.message || "Erro na conversão!");
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Tabs Header */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        textColor="secondary"
        indicatorColor="secondary"
        aria-label="converter tabs"
      >
        <Tab label="UTM → Decimal" />
        <Tab label="GMS → Decimal" />
      </Tabs>

      {/* Conteúdo da aba UTM */}
      {tabValue === 0 && (
        <Box
          sx={{
            marginTop: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            gap: "0.2rem",
          }}
        >
          <TextField
            sx={textFieldStyles}
            name="easting"
            label="Leste"
            value={utmInputs.easting}
            onChange={handleUtmChange}
            type="number"
          />

          <TextField
            sx={textFieldStyles}
            name="northing"
            label="Norte"
            value={utmInputs.northing}
            onChange={handleUtmChange}
            type="number"
          />

          <FormControl>
            <InputLabel id="zone-label">Zona</InputLabel>
            <Select
              sx={selectStyles}
              labelId="zone-label"
              name="zone"
              label="Zona"
              value={utmInputs.zone || 22}
              onChange={handleUtmChange}
            >
              {Array.from({ length: 60 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {i + 1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <InputLabel id="demo-simple-select-label">hemisfério</InputLabel>
            <Select
              sx={selectStyles}
              labelId="demo-simple-select-label"
              name="hemisphere"
              label="hemisfério"
              value={utmInputs.hemisphere}
              onChange={handleUtmChange}
            >
              <MenuItem value="N">N</MenuItem>
              <MenuItem value="S">S</MenuItem>
            </Select>
          </FormControl>

          <BtnConverter />
        </Box>
      )}

      {/* Conteúdo da aba GMS */}
      {tabValue === 1 && (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              width: "100%",
              maxWidth: "84%",
              textAlign: "left",
              marginBottom: "0.2rem",
            }}
          >
            Latitude
          </Typography>
          <Box
            sx={{
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              gap: "0.2rem",
            }}
          >
            <TextField
              sx={textFieldStyles}
              name="latDeg"
              label="Graus"
              value={gmsInputs.latDeg}
              onChange={handleGmsChange}
              type="number"
            />
            <TextField
              sx={textFieldStyles}
              name="latMin"
              label="Min"
              value={gmsInputs.latMin}
              onChange={handleGmsChange}
              type="number"
            />
            <TextField
              sx={textFieldStyles}
              name="latSec"
              label="Seg"
              value={gmsInputs.latSec}
              onChange={handleGmsChange}
              type="number"
            />

            <FormControl>
              <InputLabel id="demo-simple-select-label">hemisfério</InputLabel>
              <Select
                sx={selectStyles}
                name="latDir"
                labelId="demo-simple-select-l abel"
                value={gmsInputs.latDir}
                onChange={handleGmsChange}
                label="hemisfério"
              >
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="S">S</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Typography
            variant="body2"
            sx={{
              width: "100%",
              maxWidth: "84%",
              textAlign: "left",
              marginBottom: "0.2rem",
            }}
          >
            Longitude
          </Typography>
          <Box
            className="container"
            sx={{
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              gap: "0.2rem",
            }}
          >
            <TextField
              sx={textFieldStyles}
              name="lonDeg"
              label="Graus"
              value={gmsInputs.lonDeg}
              onChange={handleGmsChange}
              type="number"
            />
            <TextField
              sx={textFieldStyles}
              name="lonMin"
              label="Min"
              value={gmsInputs.lonMin}
              onChange={handleGmsChange}
              type="number"
            />
            <TextField
              sx={textFieldStyles}
              name="lonSec"
              label="Seg"
              value={gmsInputs.lonSec}
              onChange={handleGmsChange}
              type="number"
            />

            <FormControl>
              <InputLabel id="demo-simple-select-label">hemisfério</InputLabel>
              <Select
                sx={selectStyles}
                labelId="demo-simple-select-l abel"
                label="hemisfério"
                name="lonDir"
                value={gmsInputs.lonDir}
                onChange={handleGmsChange}
              >
                <MenuItem value="L">L</MenuItem>
                <MenuItem value="O">O</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <BtnConverter />
          </Box>
        </Box>
      )}

      {/* Rodapé */}
      <Typography
        variant="caption"
        sx={{ display: "block", textAlign: "right", mt: 1 }}
      >
        WGS84
      </Typography>

      {error && (
        <Alert severity="error" variant="filled" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
