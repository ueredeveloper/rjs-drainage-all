import React, { useState, useRef } from "react";

import {
    Checkbox,
    FormControlLabel,
    InputLabel,
    Select,
    MenuItem,
    FormControl,
    Box,
    TextField,
    CircularProgress,
    Menu,
    Paper,
    Autocomplete,
    Popper

} from "@mui/material";


import { fetchAddressByKeyword } from "../../../../services/connection";
import { useData } from "../../../../hooks/analyse-hooks";
import { convertGeometryToGmaps } from "../../../../tools";

export default function AddressControllers({ group, name, alias, checked, meters, handleCheckboxChange }) {

    const { setOverlaysFetched } = useData();

    const [anchorEl, setAnchorEl] = useState(null);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const handleSearch = async (value) => {
        if (!value || value.length < 3) {
            setOptions([]);
            return;
        }

        setLoading(true);
        try {
            const addresses = await fetchAddressByKeyword(value);
            setOptions(addresses || []);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleSelect = (option) => {
        if (option) {
            setInputValue(option?.pu_end_usual || "");
            setAnchorEl(null);

            const _shape = [
                {
                    ...option,
                    attributes: option,
                    properties: option,
                    shapeName: "enderecos_df_",
                    geometry: {
                        type: "Polygon",
                        coordinates: convertGeometryToGmaps(option.geometry),
                    },
                },
            ];

            setOverlaysFetched((prev) => {
                const newSet = new Set(prev);
                newSet.add({ name: "enderecos_df_", geometry: _shape });
                return newSet;
            });

        }

    };

    return (
        <Box
  sx={{
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start", // melhor alinhamento que "center"
    gap: 1.5, // espaçamento uniforme entre blocos
    p: 1.5,
    bgcolor: "background.paper",
    borderRadius: 2,
   
  }}
>
  {name === "enderecos_df" && (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1,
        borderRadius: 1.5,
        bgcolor: "grey.50",
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
      <FormControl size="small" sx={{ minWidth: 90 }}>
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

  {name === "geoportal_input" && (
    <Box sx={{ width: "100%" }}>
      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={options}
        getOptionLabel={(option) => option?.pu_end_usual || ""}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
          handleSearch(newInputValue);
        }}
        onChange={(event, selectedOption) => handleSelect(selectedOption)}
        isOptionEqualToValue={(option, value) =>
          option.objectid === value.objectid
        }
        noOptionsText=""
        renderInput={(params) => (
          <TextField
            {...params}
            label="Endereço"
            variant="outlined"
            size="small"
            sx={{
              bgcolor: "white",
              borderRadius: 1,
              "& .MuiInputBase-root": {
                height: 38,
                
              },
            }}
          />
        )}
        renderOption={(props, option) => (
          <li
            {...props}
            key={option.objectid}
            style={{
                marginLeft: "30px",
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
              maxHeight: "140px",
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
</Box>


    );
}