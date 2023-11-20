import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import SecondaryMenu from "../SecondaryMenu/SecondaryMenu";
import { useSession } from "next-auth/react";
import ThemeToggleButton from "../ThemeToggleButton";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { styled } from "@mui/material/styles";
import { DataContext } from "@/context/DataContext";
import { useContext, useEffect, useState } from "react";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import MarkChatUnreadIcon from "@mui/icons-material/MarkChatUnread";
import Link from "next/link";
import {
  Badge,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Modal,
  Paper,
  Radio,
  RadioGroup,
  Stack,
} from "@mui/material";
import { NotificationContext } from "@/context/NotificationContext";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { capitalize } from "@/helpers/Helpers";
import { Favorite, FavoriteBorder } from "@mui/icons-material";

export type HeaderProps = {
  ColorModeContext: React.Context<{ toggleColorMode: () => void }>;
};

const NotificationsTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: "1px solid #dadde9",
  },
}));

const Item = styled(Paper)(({ theme }) => ({
  // backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  // ...theme.typography.body2,
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,
  display: "block",
  width: "100%",
}));

const style = {
  position: "absolute" as "absolute",
  top: 64,
  right: "0%",
  width: 500,
  maxWidth: "100%",
  bgcolor: "#666666",
  boxShadow: 24,
  p: 2,
};

const Header = (props: HeaderProps) => {
  const { ColorModeContext } = props;
  // const { data: session } = useSession();
  // const userProfileImg = session?.user?.image as string;
  // const userName = session?.user?.name as string;

  const [openNotifications, setOpenNotifications] = useState(false);
  const handleOpenNotifications = () => setOpenNotifications(true);
  const handleCloseNotifications = () => setOpenNotifications(false);

  const {
    notification,
    notifications,
    notificationsCount,
    notificationUpdated,
    updateReadStatus,
    seenAll,
    markSeenAll,
  } = useContext(NotificationContext);

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const setNotificationRead = () => {
    updateReadStatus(true);
  };

  useEffect(() => {
    console.log(notifications);
  }, []);

  return (
    <AppBar position="static">
      <Container maxWidth="xl" className="">
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <WorkspacesIcon
              sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}
            />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Timepal
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            ></Menu>
          </Box>
          <WorkspacesIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Timepal
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}></Box>
          <ThemeToggleButton ColorModeContext={ColorModeContext} />

          <Badge badgeContent={notificationsCount} color="info">
            {notificationUpdated ? (
              <NotificationsIcon
                style={{
                  animation: "notification-alert 2.5s linear infinite",
                }}
                onClick={handleOpenNotifications}
                sx={{ "&:hover": { cursor: "pointer" } }}
              ></NotificationsIcon>
            ) : (
              <NotificationsIcon
                onClick={handleOpenNotifications}
                sx={{ "&:hover": { cursor: "pointer" } }}
              ></NotificationsIcon>
            )}
          </Badge>

          <Modal
            open={openNotifications}
            onClose={handleCloseNotifications}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Grid
                container
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item>
                  <Typography variant="h6">
                    {notifications.length > 0
                      ? "Notifications"
                      : "No notifications"}
                  </Typography>
                </Grid>
                {/* <Grid item>
                  <Link href="/notifications">View all</Link>
                </Grid> */}
                <Grid item>
                  {!seenAll && (
                    <Button onClick={() => markSeenAll()}>Mark seen all</Button>
                  )}
                </Grid>
              </Grid>

              <List
                sx={{
                  width: "100%",
                  maxHeight: 300,
                  overflow: "scroll",
                }}
              >
                {notifications.slice(0, 10).map((notification) => {
                  return (
                    <>
                      <ListItem
                        alignItems="flex-start"
                        sx={{ justifyContent: "space-between" }}
                      >
                        <Link href={`/tasks/${notification.target_id}`}>
                          <ListItemText>
                            {capitalize(notification.type)}{" "}
                            <b>{notification.target_name}</b> has been{" "}
                            {notification.action} by {notification.created_by}
                          </ListItemText>
                        </Link>

                        {notification.read == false ? (
                          <Tooltip title="Mark Read" placement="top">
                            <RadioButtonCheckedIcon
                              onClick={() =>
                                updateReadStatus(notification.id, true)
                              }
                              color="info"
                            ></RadioButtonCheckedIcon>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Mark Unread" placement="top">
                            <RadioButtonUncheckedIcon
                              onClick={() =>
                                updateReadStatus(notification.id, false)
                              }
                              sx={{ color: "grey" }}
                            ></RadioButtonUncheckedIcon>
                          </Tooltip>
                        )}
                      </ListItem>
                      <Divider variant="fullWidth" component="li" />
                    </>
                  );
                })}
              </List>
            </Box>
          </Modal>

          <Box sx={{ flexGrow: 0, ml: 2 }}>
            <Tooltip title="Open profile settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 2 }}>
                <Avatar
                // alt={session?.user?.name as string}
                // src={userProfileImg}
                />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <SecondaryMenu handleCloseUserMenu={handleCloseUserMenu} />
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default Header;
