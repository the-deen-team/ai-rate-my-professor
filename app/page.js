"use client";
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  useMediaQuery,
  useTheme,
  CssBaseline,
  Switch,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from "@mui/icons-material/Cancel";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
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

  const sendMessage = async () => {
    if (!message.trim()) {
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 1000);
      return;
    }

    setIsResponding(true);
    setIsLoading(true); // Start loading spinner
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
          setIsLoading(false); // Stop loading spinner
          setIsResponding(false); // Response cycle complete
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
      setIsLoading(false); // Stop loading spinner on error
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
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Button onClick={() => setDarkMode(!darkMode)} color="primary">
          {darkMode ? "Light Mode" : "Dark Mode"}
        </Button>
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Button color="inherit" href="/sign-in">Login</Button>
          <Button color="inherit" href="/sign-up">Sign Up</Button>
          {apiKeyValid ? (
            <>
              <CheckCircleIcon sx={{ color: "green", mr: 1 }} />
              <Typography variant="body2" sx={{ color: "green" }}>
                Online
              </Typography>
            </>
          ) : (
            <>
              <CancelIcon sx={{ color: "red", mr: 1 }} />
              <Typography variant="body2" sx={{ color: "red" }}>
                Offline
              </Typography>
            </>
          )}
        </Box>
        <Stack
          direction={"column"}
          width="500px"
          height="700px"
          border="1px solid"
          borderColor="divider"
          p={2}
          spacing={3}
          sx={{ boxShadow: 3, borderRadius: 2 }}
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
                        // Headings
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
