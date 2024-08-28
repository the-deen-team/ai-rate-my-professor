"use client";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignUp,
  UserButton,
  useUser,
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
  Modal,
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
import Navbar from "./components/navbar";

const shake = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
`;

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

function ProcessingModal({
  open,
  onClose,
  processingComplete,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {processingComplete ? (
          <>
            <Typography variant="h6" component="h2">
              Professor`s Info Scraped Successfully
            </Typography>
            <Stack spacing={2} mt={2}>
              <Button variant="contained" onClick={onConfirm}>
                Import to Database
              </Button>
              <Button variant="outlined" onClick={onCancel}>
                Cancel
              </Button>
            </Stack>
          </>
        ) : (
          <>
            <Typography variant="h6" component="h2">
              Processing...
            </Typography>
            <Box display="flex" justifyContent="center" mt={2}>
              <CircularProgress />
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
}

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
  const { isLoaded } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [processingModalOpen, setProcessingModalOpen] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [professorData, setProfessorData] = useState(null);

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

  if (!isLoaded) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  const insertDataIntoPinecone = async (professorData) => {
    try {
      const response = await fetch("/api/pinecone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(professorData),
      });
      return response.ok;
    } catch (error) {
      console.error("Error inserting data into Pinecone:", error);
      return false;
    }
  };

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleProcessingModalClose = () => {
    setProcessingModalOpen(false);
    setProcessingComplete(false);
    setProfessorData(null);
  };

  const handleSubmit = async (url) => {
    setModalOpen(false);
    setProcessingModalOpen(true);

    const scrapedData = await scrapeProfessorData(url);
    if (scrapedData) {
      setProfessorData(scrapedData);
      setProcessingComplete(true);
    } else {
      // Handle scraping error
      setProcessingComplete(false);
    }
  };

  const handleConfirm = async () => {
    if (professorData) {
      const success = await insertDataIntoPinecone(professorData);
      if (success) {
        // Data successfully inserted
        console.log("Data successfully inserted into Pinecone.");
      } else {
        // Handle insertion error
        console.error("Failed to insert data into Pinecone.");
      }
    }
    handleProcessingModalClose();
  };

  const handleCancel = () => {
    // Handle cancellation
    handleProcessingModalClose();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="fixed">
        <Navbar theme={theme} setDarkMode={setDarkMode} darkMode={darkMode} />
        <ProcessingModal
          open={processingModalOpen}
          onClose={handleProcessingModalClose}
          processingComplete={processingComplete}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </AppBar>
      <Toolbar />
      {}
      <Box
        width="100%"
        height="calc(100vh - 64px)"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{ overflow: "hidden", padding: "0 16px" }}
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
          <SignedIn>
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
                      sx={{
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: message.content
                          .replace(
                            /^#### (.*$)/gim,
                            '<strong style="font-size: 1rem; display: block; margin-top: 8px; margin-bottom: 8px;">$1</strong>'
                          )
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
                  maxWidth: "100%",
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
          </SignedIn>

          <SignedOut>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              textAlign="center"
            >
              <Typography variant="h6" color="textSecondary">
                Please sign in to use the chatbot.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                href="/sign-in"
                sx={{ mt: 2 }}
              >
                Sign In
              </Button>
            </Box>
          </SignedOut>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}
