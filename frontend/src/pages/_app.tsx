import type { AppProps } from "next/app";
import { SessionProvider, useSession } from "next-auth/react";
import "../styles/globals.css";
import {
  Box,
  CssBaseline,
  IconButton,
  ThemeProvider,
  createTheme,
  useTheme,
} from "@mui/material";
import React, { useContext } from "react";
import darkTheme from "@/theme/darkTheme";
import lightTheme from "@/theme/lightTheme";
import Layout from "@/components/Layout/Layout";
import AuthContext, { AuthProvider } from "@/context/AuthContext";

const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const [open, setOpen] = React.useState(true);
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
        {/* <AuthProvider> */}
        <SessionProvider session={session}>
          <CssBaseline />
          <Layout
            drawerOpen={(open: boolean) => setOpen(true)}
            drawerClose={(open: boolean) => setOpen(false)}
            open={open}
            // user={user}
          >
            <Component {...pageProps} />
          </Layout>
        </SessionProvider>
        {/* </AuthProvider> */}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
