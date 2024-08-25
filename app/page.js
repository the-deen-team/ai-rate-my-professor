"use client";
import { Box, Typography } from "@mui/material";
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
    <Box>
      {/* UI for displaying messages */}
      {messages.map((msg, index) => (
        <Typography key={index}>
          <strong>{msg.role}:</strong> {msg.content}
        </Typography>
      ))}
      {/* Input field and send button */}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </Box>
  );
}
