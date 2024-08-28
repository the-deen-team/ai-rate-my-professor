"use client";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignUp,
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
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Navbar from "@/app/components/navbar";

export default function SignUpPage() {
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
          <Navbar
            theme={theme}
            setDarkMode={setDarkMode}
            darkMode={darkMode}
            showChatbotStatus={false}
          />
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
            Sign Up
          </Typography>
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            onSignUp={() => {
              router.push("/");
            }}
          />
        </Box>
      </Container>
    </ThemeProvider>
  );
}
