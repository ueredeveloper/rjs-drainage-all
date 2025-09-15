

import {
    Checkbox,
    FormControlLabel,
    InputLabel,
    Select,
    MenuItem,
    FormControl,
    Box
} from "@mui/material";

export default function SupplySystemControllers({ group, name, alias, checked, meters, handleCheckboxChange }) {

    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 0, paddingBottom: 6, my: 0, height: "1rem" }}>
            <FormControlLabel
                control={
                    <Checkbox
                        sx={{ p: 0, mx: 1 }}
                        checked={checked}
                        onChange={handleCheckboxChange(group, name, 'checked')}
                        size="small"
                    />
                }
                label={alias}
                sx={{ '.MuiTypography-root': { fontSize: 12 } }}
            />
            <FormControl sx={{ my: 0, py: 0, marginRight: 4 }}>
                <InputLabel id="demo-simple-select-label">Metros</InputLabel>
                <Select
                    label={"Metros"}
                    value={meters}
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    onClick={(e) => e.stopPropagation()}
                    onChange={handleCheckboxChange(group, name, 'meters')}
                    sx={{ minWidth: 80, height: 30, bgcolor: "white" }}

                >
                    <MenuItem value="200">200</MenuItem>
                    <MenuItem value="500">500</MenuItem>
                    <MenuItem value="1000">1000</MenuItem>
                    <MenuItem value="3000">3000</MenuItem>
                    <MenuItem value="5000">5000</MenuItem>
                </Select>
            </FormControl>
        </Box>
    )
}