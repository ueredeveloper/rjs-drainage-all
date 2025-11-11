import React, { useState } from "react";
import "./Converter.css";
import { UtmToDec, GmsToDec } from "./ConverterUtils.js";
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
import CachedIcon from '@mui/icons-material/Cached';

/**
 * @typedef {object} ConverterProps
 * @property {function(coords: {lat: number, lng: number}): void} setMapCoords
 */
export default function Converter({ setMapCoords }) {
  const [tabValue, setTabValue] = useState(0);
  const [utmInputs, setUtmInputs] = useState({
    easting: "",
    northing: "",
    zone: "",
    hemisphere: "S",
  });
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
  const [error, setError] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError(null);
  };

  const handleUtmChange = (e) => {
    const { name, value } = e.target;
    setUtmInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleGmsChange = (e) => {
    const { name, value } = e.target;
    setGmsInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleConvert = () => {
    try {
      let coord;

      if (tabValue === 0) {
        // --- UTM → Decimal
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
        // --- GMS → Decimal
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
        <Box sx={{ mt: 2 }} className="container">
          <TextField
            className="textfield-clean"
            name="easting"
            label="Leste (E)"
            value={utmInputs.easting}
            onChange={handleUtmChange}
            type="number"
          />
          <TextField
            className="textfield-clean"
            name="northing"
            label="Norte (N)"
            value={utmInputs.northing}
            onChange={handleUtmChange}
            type="number"
          />

          <FormControl>
            <InputLabel id="zone-label">
              Zona
            </InputLabel>
            <Select
              className="input"
              labelId="zone-label"
              name="zone"
              label="Zona"
              value={utmInputs.zone || 22} // começa na zona 22
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
              labelId="demo-simple-select-label"
              name="hemisphere"
              className="input"
              label="hemisfério"
              value={utmInputs.hemisphere}
              onChange={handleUtmChange}
            >
              <MenuItem value="N">N</MenuItem>
              <MenuItem value="S">S</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" onClick={handleConvert}>
            <Tooltip title="converter">
              <CachedIcon />
            </Tooltip>
          </Button>

        </Box>
      )}

      {/* Conteúdo da aba GMS */}
      {tabValue === 1 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ marginLeft: 5.5 }}>Latitude</Typography>
          <Box className="container" sx={{ marginBottom: 2 }}>
            <TextField
              className="textfield-clean"
              name="latDeg"
              label="Graus"
              value={gmsInputs.latDeg}
              onChange={handleGmsChange}
              type="number"
            />
            <TextField
              className="textfield-clean"
              name="latMin"
              label="Min"
              value={gmsInputs.latMin}
              onChange={handleGmsChange}
              type="number"
            />
            <TextField
              className="textfield-clean"
              name="latSec"
              label="Seg"
              value={gmsInputs.latSec}
              onChange={handleGmsChange}
              type="number"
            />

            <FormControl>
              <InputLabel id="demo-simple-select-label">hemisfério</InputLabel>
              <Select
                className="input"
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

          <Typography variant="body2" sx={{ marginLeft: 5.5 }}>Longitude</Typography>
          <Box className="container">
            <TextField
              className="textfield-clean"
              name="lonDeg"
              label="Graus"
              value={gmsInputs.lonDeg}
              onChange={handleGmsChange}
              type="number"
            />

            <TextField
              className="textfield-clean"
              name="lonMin"
              label="Min"
              value={gmsInputs.lonMin}
              onChange={handleGmsChange}
              type="number"
            />
            <TextField
              className="textfield-clean"
              name="lonSec"
              label="Seg"
              value={gmsInputs.lonSec}
              onChange={handleGmsChange}
              type="number"
            />

            <FormControl>
              <InputLabel id="demo-simple-select-label">hemisfério</InputLabel>
              <Select
                className="input"
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

          <Box sx={{ display: "flex", justifyContent: "right", mt: 1, marginRight:6 }}>

            <Button variant="contained" onClick={handleConvert}>
              <Tooltip title="converter">
                <CachedIcon />
              </Tooltip>
            </Button>

          </Box>
        </Box>
      )}

      {/* Botão Converter e feedback */}


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
