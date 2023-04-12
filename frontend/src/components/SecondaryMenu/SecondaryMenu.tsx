import React from "react";
const settings = ["Account", "Dashboard", "Logout"];
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useSession, signIn, signOut } from "next-auth/react";

const SecondaryMenu = (handleCloseUserMenu) => {
  const { data: session } = useSession();
  return (
    <>
      {session ? (
        <MenuItem onClick={signOut}>
          <Typography textAlign="center">Sign out</Typography>
        </MenuItem>
      ) : (
        <MenuItem onClick={signIn}>
          <Typography textAlign="center">Sign in</Typography>
        </MenuItem>
      )}
    </>
  );
};

export default SecondaryMenu;
