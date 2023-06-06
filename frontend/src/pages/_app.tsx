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
import React, { createContext, useContext, useEffect, useState } from "react";
import darkTheme from "@/theme/darkTheme";
import lightTheme from "@/theme/lightTheme";
import Layout from "@/components/Layout/Layout";
import AuthContext, { AuthProvider } from "@/context/AuthContext";
import { useCookies } from "react-cookie";

const ColorModeContext = React.createContext({ toggleColorMode: () => {} });
interface runningTracking {
  hours: number;
  minutes: number;
  seconds: number;
}

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const [open, setOpen] = React.useState(true);
  const [mode, setMode] = React.useState<"light" | "dark">("dark");
  const [trackingCookie, setTrackingCookie] = useCookies(["tracking"]);
  const [runningTracking, setRunningTracking] = useState<runningTracking>();
  const [testProps, setTestProps] = useState("123");
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

  useEffect(() => {
    if (trackingCookie.tracking == undefined) {
      return;
    }
    let time = trackingCookie?.tracking?.readableTime;
    setRunningTracking({
      hours: time.hours,
      minutes: time.minutes,
      seconds: time.seconds,
    });
  }, [trackingCookie]);

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
            runningTracking={runningTracking}
            trackingCookie={trackingCookie}
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
