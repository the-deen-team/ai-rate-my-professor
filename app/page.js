"use client";
import { Box, Typography } from "@mui/material";
import { useState, useEffect } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm the rate my professor support assistant, how can I help you today?"

    }
  ])   
  const [message, setMessage] = useState('')
  const sendMessage = async() => {
    setMessages((messages)=> [
      ...messages,
      {role: "user", content: message}
      {role: "assistant", content: '' }
  ])

  setMessage('')
  const response = fetch('/api/chat', {
    method: "POST"
    headers: {
      'Content-Type:', 'application/json'
    },
    body: JSON.stringify([...messages, {role: "user", content: message}])
  }).then(async(res))

}
  return(
  
  );
}
