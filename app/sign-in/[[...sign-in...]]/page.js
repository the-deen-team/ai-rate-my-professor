"use client";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignIn,
  UserButton,
} from "@clerk/nextjs";
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  CssBaseline,
} from "@mui/material";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SettingsIcon from "@mui/icons-material/Settings";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { createTheme, ThemeProvider } from "@mui/material/styles";

export default function SignInPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#1976d2", // Deep Blue
      },
      secondary: {
        main: "#d32f2f", // Red
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="100vw">
        <AppBar position="fixed">
          <Toolbar>
            <Typography
              variant="h6"
              sx={{
                flexGrow: 1,
              }}
            >
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
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem>
                <SignedIn>
                  <UserButton />
                  Manage Profile
                </SignedIn>
              </MenuItem>
              <MenuItem>
                <Switch
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  icon={<Brightness7Icon />}
                  checkedIcon={<Brightness4Icon />}
                />
                <Typography variant="body1">
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Toolbar /> {/* This spacer pushes the content below the navbar */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="calc(100vh - 64px)"
          mt={0}
        >
          <Typography variant="h4" sx={{ mb: 2 }}>
            Sign In
          </Typography>
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            onSignIn={() => {
              router.push("/");
            }}
          />
        </Box>
      </Container>
    </ThemeProvider>
  );
}
