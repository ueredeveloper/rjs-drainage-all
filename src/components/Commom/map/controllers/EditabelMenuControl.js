import React from "react";
import { createRoot } from "react-dom/client";
import { Autocomplete, TextField } from "@mui/material";

export default function EditableMenuController({ map }) {
  const [options, setOptions] = React.useState([]);
  const [inputValue, setInputValue] = React.useState("");
  const rootRef = React.useRef(null);
  const controlDivRef = React.useRef(null);

  React.useEffect(() => {
    if (!map) return;

    // cria um container para o input
    const controlDiv = document.createElement("div");
    controlDiv.style.padding = "6px";
    controlDiv.style.background = "white";
    controlDiv.style.borderRadius = "6px";
    controlDiv.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    controlDiv.style.margin = "10px";

    controlDivRef.current = controlDiv;
    rootRef.current = createRoot(controlDiv);

    // adiciona no mapa (TOP_LEFT, pode trocar se quiser)
    map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(controlDiv);

    return () => {
      // remove quando desmontar
      if (controlDivRef.current) {
        const controls = map.controls[window.google.maps.ControlPosition.TOP_LEFT];
        for (let i = 0; i < controls.getLength(); i++) {
          if (controls.getAt(i) === controlDivRef.current) {
            controls.removeAt(i);
            break;
          }
        }
      }
    };
  }, [map]);

  React.useEffect(() => {
    if (!rootRef.current) return;

    rootRef.current.render(
      <Autocomplete
        freeSolo
        options={options}
        inputValue={inputValue}
        onInputChange={(e, newInputValue) => setInputValue(newInputValue)}
        value={inputValue}
        onChange={(e, newValue) => {
          if (newValue && !options.includes(newValue)) {
            setOptions((prev) => [...prev, newValue]);
          }
          setInputValue(newValue || "");
        }}
        disablePortal
        getOptionLabel={(option) => option}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Buscar endereço"
            size="small"
            variant="outlined"
            fullWidth
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputValue.trim() !== "") {
                e.preventDefault();
                if (!options.includes(inputValue)) {
                  setOptions((prev) => [...prev, inputValue]);
                }
                setInputValue("");
              }
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option}>
            {option}
          </li>
        )}
        style={{ width: 250 }}
      />
    );
  }, [options, inputValue]);

  return null;
}
