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
  }).then(async(res)=>{
    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    let result = ''
    return reader.read().then(function processText({done, value}) {
      if (done){
        return result
      }
      const text = decoder.decode (value [] new Uint8Array(), {stream: true})
      setMessages((messages)=>{
        let lastMessage = messages[messages.length - 1]
        let otherMessages = messages.slice(0, messages.length - 1)
        return[
          ...otherMessages,
          {...lastMessage, content, lastMessage.content + text},

        ]
      })
      return reader.read().then(processText)
    })

  })


}
  return<></>
}
