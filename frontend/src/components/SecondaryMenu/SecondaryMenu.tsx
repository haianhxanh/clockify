import React from "react";
const settings = ["Account", "Dashboard", "Logout"];
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { signOut } from "next-auth/react";

const SecondaryMenu = (handleCloseUserMenu) => {
  return (
    <>
      <MenuItem onClick={handleCloseUserMenu}>
        <Typography textAlign="center">Profile</Typography>
      </MenuItem>
      <MenuItem onClick={signOut}>
        <Typography textAlign="center">Sign out</Typography>
      </MenuItem>
    </>
  );
};

export default SecondaryMenu;
