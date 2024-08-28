import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  ButtonBase,
  Box,
} from "@mui/material";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import SettingsIcon from "@mui/icons-material/Settings";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

function Navbar({ theme, setDarkMode, darkMode, showChatbotStatus = true }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [apiKeyValid, setApiKeyValid] = React.useState(true);
  const { isLoaded } = useUser();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUserButtonClick = () => {
    const userButtonElement = document.querySelector(".cl-userButtonTrigger");
    if (userButtonElement) {
      userButtonElement.click();
    }
  };

  const handleUserButtonDirectClick = (e) => {
    e.stopPropagation(); // Prevent direct clicks on UserButton from triggering its default action
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Rate My Professor
        </Typography>
        <Button color="inherit" href="/">
          Home
        </Button>
        <SignedOut>
          <Button color="inherit" href="/sign-in">
            Login
          </Button>
          <Button color="inherit" href="/sign-up">
            Sign Up
          </Button>
        </SignedOut>
        <IconButton
          color="inherit"
          aria-label="settings"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
        >
          <SettingsIcon />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          sx={{ mt: 1 }}
        >
          <SignedIn>
            <MenuItem component={ButtonBase} onClick={handleUserButtonClick}>
              <div onClick={handleUserButtonDirectClick}>
                <UserButton />
              </div>
              <Typography variant="body1" sx={{ ml: 2 }}>
                Manage Profile
              </Typography>
            </MenuItem>
          </SignedIn>
          <MenuItem
            component={ButtonBase}
            onClick={() => setDarkMode(!darkMode)}
          >
            <Switch
              checked={darkMode}
              icon={<Brightness7Icon />}
              checkedIcon={<Brightness4Icon />}
              onChange={() => {}}
            />
            <Typography variant="body1" sx={{ ml: 2 }}>
              {darkMode ? "Light Mode" : "Dark Mode"}
            </Typography>
          </MenuItem>
          {showChatbotStatus && (
            <MenuItem>
              {apiKeyValid ? (
                <>
                  <CheckCircleIcon sx={{ color: "green", mr: 1 }} />
                  <Typography variant="body1">Chatbot Online</Typography>
                </>
              ) : (
                <>
                  <CancelIcon sx={{ color: "red", mr: 1 }} />
                  <Typography variant="body1">Chatbot Offline</Typography>
                </>
              )}
            </MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
