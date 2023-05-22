import React from "react";
const settings = ["Account", "Dashboard", "Logout"];
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Link from "next/link";
// import { useSession, signIn, signOut } from "next-auth/react";

const SecondaryMenu = (handleCloseUserMenu) => {
  // const { data: session } = useSession();
  return (
    <>
      {/* {session ? (
        <MenuItem onClick={signOut}>
          <Typography textAlign="center">Sign out</Typography>
        </MenuItem>
      ) : (
        <MenuItem onClick={signIn}>
          <Typography textAlign="center">Sign in</Typography>
        </MenuItem>
      )} */}

      <MenuItem>
        <Typography textAlign="center">
          <Link href="/login">Login</Link>
        </Typography>
      </MenuItem>
    </>
  );
};

export default SecondaryMenu;
