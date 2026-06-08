import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  typography: {
    fontSize: 12,
    htmlFontSize: 16,
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: '0.72rem',
          minHeight: 36,
          padding: '6px 12px',
          '@media (max-width:600px)': {
            fontSize: '0.65rem',
            padding: '4px 8px',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 36,
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.85rem',
          fontWeight: 600,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '0.72rem',
          padding: '6px 8px',
          '@media (max-width:600px)': {
            fontSize: '0.65rem',
            padding: '4px 6px',
          },
        },
        head: {
          fontWeight: 600,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        dense: {
          minHeight: 44,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '0.8rem',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.8rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '0.7rem',
        },
        label: {
          fontSize: '0.7rem',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
