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
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  Switch,
  CssBaseline,
  Stack,
  TextField,
  CircularProgress,
  ButtonBase,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import SettingsIcon from "@mui/icons-material/Settings";
import { keyframes } from "@emotion/react";

const shake = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
`;

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the rate my professor support assistant, how can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shakeInput, setShakeInput] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState(false);
  const [isResponding, setIsResponding] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify([{ role: "user", content: "Ping" }]),
        });

        if (response.ok) {
          setApiKeyValid(true);
        } else {
          setApiKeyValid(false);
        }
      } catch (error) {
        setApiKeyValid(false);
      }
    };

    checkApiKey();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const sendMessage = async () => {
    if (!message.trim()) {
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 1000);
      return;
    }

    setIsResponding(true);
    setIsLoading(true);
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let result = "";
      reader.read().then(function processText({ done, value }) {
        if (done) {
          setIsLoading(false);
          setIsResponding(false);
          return result;
        }
        const text = decoder.decode(value || new Int8Array(), { stream: true });
        if (text.includes("The chatbot is going offline")) {
          setApiKeyValid(false);
        }
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ];
        });
        return reader.read().then(processText);
      });
    } catch (error) {
      setIsResponding(false);
      setIsLoading(false);
      setApiKeyValid(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isResponding) {
        sendMessage();
      }
    }
  };

  const handleUserButtonClick = () => {
    const userButtonElement = document.querySelector(".cl-userButtonTrigger");
    if (userButtonElement) {
      userButtonElement.click();
    }
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#d32f2f",
      },
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? "rgba(255, 255, 255, 0.09)" : "#fff",
            borderRadius: 4,
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
                <UserButton />
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
          </Menu>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* This spacer pushes the content below the navbar */}
      <Box
        width="100%"
        height="calc(100vh - 64px)"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{ overflow: "hidden" }}
      >
        <Stack
          direction={"column"}
          width="100%"
          maxWidth="500px"
          height="100%"
          maxHeight="700px"
          border="1px solid"
          borderColor="divider"
          p={2}
          spacing={3}
          sx={{ boxShadow: 3, borderRadius: 2, overflow: "hidden" }}
        >
          <Stack
            direction={"column"}
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === "assistant" ? "flex-start" : "flex-end"
                }
                sx={{ mt: 1 }}
              >
                <Box
                  bgcolor={
                    message.role === "assistant"
                      ? "primary.main"
                      : "secondary.main"
                  }
                  color="white"
                  borderRadius={2}
                  p={2}
                  sx={{ maxWidth: "70%" }}
                >
                  <Typography
                    variant="body1"
                    sx={{ whiteSpace: "pre-wrap" }}
                    dangerouslySetInnerHTML={{
                      __html: message.content
                        .replace(
                          /^### (.*$)/gim,
                          '<strong style="font-size: 1.25rem; display: block; margin-top: 10px; margin-bottom: 10px;">$1</strong>'
                        )
                        .replace(
                          /^## (.*$)/gim,
                          '<strong style="font-size: 1.5rem; display: block; margin-top: 12px; margin-bottom: 12px;">$1</strong>'
                        )
                        .replace(
                          /^# (.*$)/gim,
                          '<strong style="font-size: 2rem; display: block; margin-top: 14px; margin-bottom: 14px;">$1</strong>'
                        )
                        // Bold
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        // Italics
                        .replace(/\*(.*?)\*/g, "<em>$1</em>")
                        // Links
                        .replace(
                          /\[(.*?)\]\((.*?)\)/g,
                          '<a href="$2" target="_blank" style="color: #FFEB3B;">$1</a>'
                        ),
                    }}
                  />
                  {index === messages.length - 1 &&
                    isLoading &&
                    message.role === "assistant" &&
                    !message.content && (
                      <CircularProgress size={24} color="inherit" />
                    )}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
          <Stack direction={"row"} spacing={2}>
            <TextField
              label="Message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              error={shakeInput}
              disabled={isResponding}
              sx={{
                animation: shakeInput ? `${shake} 0.5s` : "none",
                borderColor: shakeInput ? "red" : "primary.main",
                "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: shakeInput ? "red" : "primary.main",
                  },
              }}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={isResponding}
            >
              Send
            </Button>
          </Stack>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}
