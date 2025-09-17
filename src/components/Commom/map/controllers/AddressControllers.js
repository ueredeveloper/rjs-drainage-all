import React, { useState } from "react";

import {
  Checkbox,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Box,
  TextField,
  Autocomplete,
  Popper

} from "@mui/material";


import { fetchAddressByKeyword } from "../../../../services/connection";
import { useData } from "../../../../hooks/analyse-hooks";
import { convertGeometryToGmaps, getPolygonEsriCentroid } from "../../../../tools";

export default function AddressControllers({ group, name, alias, checked, setCheckboxes, meters, handleCheckboxChange }) {

  const { setOverlaysFetched } = useData();

  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const handleInputSearch = async (value) => {

    console.log('handleInputSearch', value);
    if (!value || value.length < 3) {
      setOptions([]);
      return;
    }

    try {
      const addresses = await fetchAddressByKeyword(value);
      setOptions(addresses || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputSelect = (option) => {
    if (option) {
      setInputValue(option?.pu_end_usual || "");

      // Adiciona o polígono do endereço selecionado ao mapa
      const _shape = [
        {
          ...option,
          attributes: option,
          properties: option,
          shapeName: "enderecos_por_logradouro" + option?.pu_end_usual,
          geometry: {
            type: "Polygon",
            coordinates: convertGeometryToGmaps(option.geometry),
          },
        },
      ];


      setOverlaysFetched((prev) => {
        const newSet = new Set(prev);
        newSet.add({ name: "enderecos_por_logradouro" + option?.pu_end_usual, geometry: _shape });
        return newSet;
      });

      let centroid = getPolygonEsriCentroid(_shape[0].properties.geometry) || null;

      setCheckboxes((prev) => ({
        ...prev,
        [group]: {
          ...prev[group],
          [name]: {
            ...prev[group][name],
            ["checked"]: true,
            // Primeira coordenada do polígono para centralizar o mapa
            point: centroid
          },
        },
      }));
      // Espera dois segundos e desmarca o checkbox
      setTimeout(function () {
        setCheckboxes((prev) => ({
          ...prev,
          [group]: {
            ...prev[group],
            [name]: {
              ...prev[group][name],
              //["checked"]: false,
              // Desta forma não será mais dado zoom
              point: null
            },
          },
        }));
      }, 2000); // 2000 milissegundos = 2 segundos

    }

  };

  function CustomPopper(props) {
    return <Popper {...props} placement="bottom-start" />;
  }

  return (
    <Box sx={{ width: "100%", '.MuiTypography-root': { fontSize: 12 } }}>
      {name === "enderecos_por_logradouro" && (
        <Box sx={{ width: "100%", marginTop: 1 }}>
          <Autocomplete
            disablePortal
            PopperComponent={CustomPopper}
            id="combo-box-demo"
            options={options}
            getOptionLabel={(option) => option?.pu_end_usual || ""}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
              handleInputSearch(newInputValue);
            }}
            onChange={(event, selectedOption) => handleInputSelect(selectedOption)}
            isOptionEqualToValue={(option, value) =>
              option.objectid === value.objectid
            }
            noOptionsText=""
            renderInput={(params) => (
              <TextField
                {...params}
                label={alias}
                variant="outlined"
                size="small"
                sx={{
                  bgcolor: "white",
                  borderRadius: 1,
                  "& .MuiInputBase-root": {
                    height: 30,
                    my: 0.5
                  },
                }}
              />
            )}
            renderOption={(props, option) => (
              <li
                {...props}
                key={option.objectid}
                style={{

                  textAlign: "left",
                  padding: "6px 10px",
                  fontSize: "0.85rem",
                  backgroundColor: "white",
                }}
              >
                {`→ ${option?.pu_end_usual || ""}`}
              </li>
            )}
            PaperComponent={(props) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  maxHeight: "220px",
                  overflowY: "auto",
                  borderRadius: "8px",
                }}
              />
            )}
            sx={{
              width: "100%",
              bgcolor: "white",
              borderRadius: 1.5,

            }}
          />
        </Box>
      )}
      {name === "enderecos_por_coordenada" && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1,
            borderRadius: 1.5,
            bgcolor: "grey.50",
            marginTop: 1,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                sx={{
                  p: 0.5,
                  color: "primary.main",
                  "&.Mui-checked": { color: "primary.main" },
                }}
                checked={checked}
                onChange={handleCheckboxChange(group, name, "checked")}
                size="small"
              />
            }
            label={alias}
            sx={{
              ".MuiTypography-root": { fontSize: 13, fontWeight: 500 },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 80 }}>
            <InputLabel id="metros-label">Metros</InputLabel>
            <Select
              label="Metros"
              value={meters}
              labelId="metros-label"
              id="select-metros"
              onClick={(e) => e.stopPropagation()}
              onChange={handleCheckboxChange(group, name, "meters")}
              sx={{
                height: 36,
                bgcolor: "white",
                borderRadius: 1,
              }}
              MenuProps={{
                disablePortal: true,
                PaperProps: {
                  sx: { zIndex: 2000 },
                },
              }}
            >
              {[200, 500, 1000, 3000, 5000].map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {name === "regioes_administrativas" && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1,
            borderRadius: 1.5,
            bgcolor: "grey.50",
            marginTop: 2
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                sx={{
                  p: 0.5,
                  color: "primary.main",
                  "&.Mui-checked": { color: "primary.main" },
                }}
                checked={checked}
                onChange={handleCheckboxChange(group, name, "checked")}
                size="small"
              />
            }
            label={alias}
            sx={{
              ".MuiTypography-root": { fontSize: 13, fontWeight: 500 },
            }}
          />

        </Box>
      )}


    </Box>


  );
}