import React, { useState } from "react";
import {
    Autocomplete,
    TextField,
    CircularProgress,
    Box,
    Paper,
} from "@mui/material";
import { fetchAddressByKeyword } from "../../../../services/connection";

export default function AddressSearchBox() {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (event, value) => {
        if (!value || value.length < 3) {
            setOptions([]);
            return;
        }

        setLoading(true);

        try {
            const addresses = await fetchAddressByKeyword(value);

            console.log(addresses.slice(4))
            setOptions(addresses || []);
        } catch (err) {
            console.error(err);
        }

        setLoading(false);
    };

    return (
        <Box sx={{ width: "100%", zIndex: 20000 }}>
            <Autocomplete
                id="autocomplete-address"
                freeSolo
                disableClearable
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                onInputChange={handleSearch}
                options={options}
                getOptionLabel={(option) => option.pu_end_usual || ""}
                isOptionEqualToValue={(option, value) =>
                    option.objectid === value.objectid
                }

                loading={loading}
                clearIcon={null} // 👈 no clear button
                PaperComponent={(props) => (
                    <Paper
                        {...props}
                        sx={{ position: "absolute" }}
                    />
                )}
                onChange={(event, newValue) => {
                    if (newValue) {
                        console.log("Selecionado:", newValue);
                    }
                }}
                renderOption={(props, option) => (
                    <li id="autocomplete-li" {...props} key={option.objectid}>
                        {option.pu_end_usual}
                        
                    </li>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Buscar endereços"
                        variant="standard"
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {loading ? <CircularProgress size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                        sx={{ width: "100%", my: 1, zIndex: 20000 }}
                    />
                )}
            />
        </Box>
    );
}
