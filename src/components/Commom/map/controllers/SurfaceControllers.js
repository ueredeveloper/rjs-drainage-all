
import {
    Box,
    Checkbox,
    FormControlLabel
} from "@mui/material";

export default function SurfaceControllers({ group, name, alias, checked, handleCheckboxChange }) {

    return (
        <Box id="sufrace" sx={{ display: "flex", flexDirection: "column", padding:0 }}>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={checked}
                        onChange={handleCheckboxChange(group, name, 'checked')}
                        size="small"
                    />
                }
                label={alias}
                sx={{ '.MuiTypography-root': { fontSize: 12 } }}
            />
        </Box>
    )
}