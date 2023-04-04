import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import {
  Box,
  CssBaseline,
  IconButton,
  ThemeProvider,
  createTheme,
  useTheme,
} from "@mui/material";
import React from "react";
import darkTheme from "@/theme/darkTheme";
import lightTheme from "@/theme/lightTheme";

const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const [mode, setMode] = React.useState<"light" | "dark">("dark");
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const darkThemeChosen = React.useMemo(
    () =>
      createTheme({
        ...darkTheme,
      }),
    [mode]
  );

  const lightThemeChosen = React.useMemo(
    () =>
      createTheme({
        ...lightTheme,
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider
        theme={mode === "dark" ? darkThemeChosen : lightThemeChosen}
      >
        <SessionProvider session={session}>
          <CssBaseline />
          <Component {...pageProps} />
        </SessionProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
