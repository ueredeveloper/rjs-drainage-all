import React, { createContext, useContext, useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';
import baseTheme from '../theme';
import { DEFAULT_FONT_SIZE } from './components/SettingsPanel';

const FontSizeContext = createContext({
  fontSize: DEFAULT_FONT_SIZE,
  scale: 1,
  scalePx: (px) => px,
});


/** Hook para acessar tamanho de fonte e escala proporcional. */
export function useFontSize() {
  return useContext(FontSizeContext);
}

/**
 * Aplica o tamanho de fonte apenas enquanto o new-design (#nd-root) está montado.
 * Não altera o layout legado fora dessa rota.
 */
export function FontSizeProvider({ fontSize, children }) {
  const scale = fontSize / DEFAULT_FONT_SIZE;

  const theme = useMemo(
    () =>
      createTheme(baseTheme, {
        typography: {
          htmlFontSize: fontSize,
          fontSize: (baseTheme.typography?.fontSize ?? 12) * scale,
        },
      }),
    [fontSize, scale]
  );

  const value = useMemo(
    () => ({
      fontSize,
      scale,
      scalePx: (px) => Math.round(px * scale * 10) / 10,
    }),
    [fontSize, scale]
  );

  return (
    <FontSizeContext.Provider value={value}>
      <GlobalStyles
        styles={{
          'html:has(#nd-root)': { fontSize: `${fontSize}px` },
          '#nd-root': { fontSize: '1rem' },
        }}
      />
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </FontSizeContext.Provider>
  );
}
