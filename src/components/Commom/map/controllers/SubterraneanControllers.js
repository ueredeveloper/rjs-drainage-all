
import {
    Box,
    Checkbox,
    FormControlLabel,
    Tooltip
} from "@mui/material";

export default function SubterraneanControlllers({ group, name, alias, checked, isWaterAvailable, handleCheckboxChange }) {


    return (
        <Box>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={checked}
                        onChange={handleCheckboxChange(group, name, 'checked')}
                        size="small"
                        sx={{ my: 0, mx: 0 }}
                    />
                }
                label={alias}
                sx={{ maxHeight: "4px", minHeight: "px", '.MuiTypography-root': { fontSize: 12, p: 0, m: 0 }, m: 0, p: 0 }}
            />
            <FormControlLabel
                control={
                    <Tooltip title={name}>
                        <Checkbox
                            checked={isWaterAvailable}
                            onChange={handleCheckboxChange(group, name, 'isWaterAvailable')}
                            size="small"
                            sx={{ my: 0, mx: 0 }}
                        />
                    </Tooltip>
                }
                label="% Cálculo de Uso"
                sx={{ p: 0, mx: 2, '.MuiTypography-root': { fontSize: 12, p: 0, m: 0 } }}
            />
        </Box>

    )
}