
import {
    Checkbox,
    FormControlLabel,
    InputLabel,
    Select,
    MenuItem,
    FormControl,
    Box,
    TextField
} from "@mui/material";
import AddressSearchBox from './AddressSearchBox'

export default function AddressControllers({ group, name, alias, checked, meters, handleCheckboxChange }) {

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", }}>
            {(name === "enderecos_df") && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                sx={{ padding: 0.5 }}
                                checked={checked}
                                onChange={handleCheckboxChange(group, name, 'checked')}
                                size="small"
                            />
                        }
                        label={alias}
                        sx={{ '.MuiTypography-root': { fontSize: 12 } }}
                    />
                    <FormControl>
                        <InputLabel id="demo-simple-select-label">Metros</InputLabel>
                        <Select
                            label={"Metros"}
                            value={meters}
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            onClick={(e) => e.stopPropagation()}
                            onChange={handleCheckboxChange(group, name, 'meters')}
                            sx={{ minWidth: 80, height: 35, bgcolor: "white" }}
                            MenuProps={{
                                disablePortal: true,
                                PaperProps: {
                                    sx: {
                                        zIndex: 2000, // coloca acima do mapa
                                    },
                                },
                            }}
                        >
                            <MenuItem value="200">200</MenuItem>
                            <MenuItem value="500">500</MenuItem>
                            <MenuItem value="1000">1000</MenuItem>
                            <MenuItem value="3000">3000</MenuItem>
                            <MenuItem value="5000">5000</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            )}
            {(name === "geoportal_input") && (
                <Box id="address-search-box" sx={{ width: "100%" }}>
                    <AddressSearchBox id="address-search-component" />
                </Box>
            )}
        </Box>
    )
}