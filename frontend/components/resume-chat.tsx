"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, Send, Loader2, Bot, User } from 'lucide-react'
import { ResumeAnalysis } from '@/lib/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

interface ResumeChatProps {
  analysis: ResumeAnalysis
  sessionId: string
}

export function ResumeChat({ analysis, sessionId }: ResumeChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm your AI resume assistant. I've analyzed your resume and I'm here to answer any questions about the results. Ask me anything about your scores, suggestions, or how to improve specific sections!`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const userInput = input
    setInput('')
    setLoading(true)

    // Scroll to bottom when user sends a message
    setTimeout(scrollToBottom, 100)

    // Don't add placeholder - we'll show loading indicator separately

    try {
      console.log('Sending chat message:', userInput)

      // Fetch the full response (not streaming from backend)
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': '1234',
        },
        body: JSON.stringify({
          message: userInput,
          session_id: sessionId,
          analysis: analysis,
        }),
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      const fullResponse = data.response

      // Add the assistant message now
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          isStreaming: true,
        },
      ])

      // Simulate streaming by displaying characters gradually
      let currentIndex = 0
      const charsPerInterval = 10 // More chars per update for faster speed

      const streamInterval = setInterval(() => {
        if (currentIndex < fullResponse.length) {
          const nextChunk = fullResponse.slice(0, currentIndex + charsPerInterval)
          currentIndex += charsPerInterval

          setMessages((prev) => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage.role === 'assistant') {
              lastMessage.content = nextChunk
              lastMessage.isStreaming = true
            }
            return newMessages
          })
        } else {
          // Finished streaming
          clearInterval(streamInterval)
          setMessages((prev) => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage.role === 'assistant') {
              lastMessage.content = fullResponse
              lastMessage.isStreaming = false
            }
            return newMessages
          })
          setLoading(false)
        }
      }, 30) // Update every 30ms for blazing fast streaming (~333 chars/sec)

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Please try again.'}`,
        timestamp: new Date(),
      }
      setMessages((prev) => {
        // Remove the placeholder message and add error message
        const filtered = prev.filter((msg) => !msg.isStreaming)
        return [...filtered, errorMessage]
      })
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-background">
      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-5 h-5 text-primary" />
              </div>
            )}
            <div
              className={`group max-w-[75%] md:max-w-[65%] rounded-2xl px-4 py-2.5 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-muted rounded-bl-sm'
              }`}
            >
              <div className="text-sm leading-relaxed break-words prose prose-sm dark:prose-invert max-w-none">
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap m-0">{message.content}</p>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="mb-2 pl-4 list-disc">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-2 pl-4 list-decimal">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      code: ({ children }) => (
                        <code className="bg-primary/10 px-1 py-0.5 rounded text-xs font-mono">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-primary/10 p-2 rounded my-2 overflow-x-auto">
                          {children}
                        </pre>
                      ),
                      h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
                {message.isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-current animate-pulse" />
                )}
              </div>
              <span
                className={`text-[10px] mt-1.5 block ${
                  message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}
        {loading && (messages.length === 0 || messages[messages.length - 1]?.role !== 'assistant') && (
          <div className="flex gap-3 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="border-t bg-card/80 backdrop-blur-sm sticky bottom-0">
        <div className="px-4 py-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message your AI assistant..."
                disabled={loading}
                className="pr-4 py-6 rounded-full border-2 focus-visible:ring-offset-0 focus-visible:ring-2 resize-none"
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              size="icon"
              className="h-12 w-12 rounded-full flex-shrink-0 shadow-lg"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 text-center px-2">
            Try: "How can I improve my ATS score?" or "What are my biggest weaknesses?"
          </p>
        </div>
      </div>
    </div>
  )
}
