
import {
    Box,
    Checkbox,
    FormControlLabel,
    Tooltip,
    Switch
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

                    />
                }
                label={alias}
                sx={{ maxHeight: "4px", '.MuiTypography-root': { fontSize: 12 } }}
            />
            <FormControlLabel
                sx={{ px: 3, '.MuiTypography-root': { fontSize: 12 } }}
                control={
                    <Tooltip title={name}>
                        <Switch checked={isWaterAvailable}
                            onChange={handleCheckboxChange(group, name, 'isWaterAvailable')}
                            size="small"
                        />
                    </Tooltip>
                }
                label={"Cálculo de Uso"}
            />

        </Box>

    )
}