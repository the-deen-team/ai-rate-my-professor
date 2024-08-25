"use client";
import { Box, Typography, Stack, TextField, Button, useMediaQuery, useTheme, CssBaseline, Switch } from '@mui/material';
import { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2', // Deep Blue
      },
      secondary: {
        main: '#d32f2f', // Red
      },
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.09)' : '#fff',
            borderRadius: 4,
          },
        },
      },
    },
  });

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the rate my professor support assistant, how can I help you today?"
    }
  ]);
  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    // Append the user's message and an empty assistant message
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' }
    ]);

    setMessage(''); // Clear the input message after sending

    // Fetch request to the API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    const processText = async ({ done, value }) => {
      if (done) return result;
      const text = decoder.decode(value, { stream: true });
      result += text;

      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          { ...lastMessage, content: lastMessage.content + text },
        ];
      });

      return reader.read().then(processText);
    };

    reader.read().then(processText);
  };

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
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </Button>
        <Stack
          direction={'column'}
          width="500px"
          height="700px"
          border="1px solid"
          borderColor="divider"
          p={2}
          spacing={3}
          sx={{ boxShadow: 3, borderRadius: 2 }}
        >
          <Stack
            direction={'column'}
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
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
                sx={{ mt: 1 }}
              >
                <Box
                  bgcolor={
                    message.role === 'assistant'
                      ? 'primary.main'
                      : 'secondary.main'
                  }
                  color="white"
                  borderRadius={2}
                  p={2}
                  sx={{ maxWidth: '70%' }}
                >
                  <Typography variant="body1">{message.content}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
          <Stack direction={'row'} spacing={2}>
            <TextField
              label="Message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button variant="contained" onClick={sendMessage}>
              Send
            </Button>
          </Stack>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}
