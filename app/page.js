"use client";
import { Box, Typography, Stack, TextField, Button } from "@mui/material";
import { useState, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm the rate my professor support assistant, how can I help you today?"
    }
  ]);
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    // Append the user's message and an empty assistant message
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" }
    ]);

    setMessage(""); // Clear the input message after sending

    // Fetch request to the API
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Fixed header value
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]), // Send message with previous messages
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let result = "";

    // Process the stream of text from the API response
    const processText = async ({ done, value }) => {
      if (done) return result; // Exit when done reading

      const text = decoder.decode(value, { stream: true });
      result += text;

      // Update the assistant's message with the streamed content
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          { ...lastMessage, content: lastMessage.content + text }, // Append new text to last assistant message
        ];
      });

      return reader.read().then(processText); // Recursively process the next chunk
    };

    reader.read().then(processText); // Start reading the response
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction={'column'}
        width="500px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
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
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'primary.main'
                    : 'secondary.main'
                }
                color="white"
                borderRadius={16}
                p={3}
              >
                {message.content}
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
  )
}
