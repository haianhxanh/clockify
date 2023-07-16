import { ReactNode, createContext, useContext, useState } from "react";

interface SnackbarContextProps {
  open: boolean;
  status: string;
  message: string;
}

interface SnackbarContextProviderProps {
  children: ReactNode;
}

const SnackbarContext = createContext<SnackbarContextProps>({
  open: false,
  status: "success",
  message: "",
});

const SnackbarContextProvider = ({
  children,
}: SnackbarContextProviderProps) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    status: "success",
    message: "",
  });

  return (
    <SnackbarContext.Provider value={{ snackbar, setSnackbar }}>
      {children}
    </SnackbarContext.Provider>
  );
};

export { SnackbarContext, SnackbarContextProvider };
