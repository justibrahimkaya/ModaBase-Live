'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, X, Minimize2, Maximize2, Clock, Phone, Mail } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'agent'
  timestamp: Date
}

interface Conversation {
  id: string
  userId?: string
  guestName?: string
  guestEmail?: string
  subject: string
  status: 'active' | 'closed' | 'pending'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  department: string
  isGuest: boolean
  createdAt: Date
}

interface ChatState {
  isOpen: boolean
  isMinimized: boolean
  isTyping: boolean
  messages: Message[]
  currentMessage: string
  conversation: Conversation | null
  isLoading: boolean
  isConnected: boolean
  unreadCount: number
}

const LiveChat: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    isOpen: false,
    isMinimized: false,
    isTyping: false,
    messages: [
      {
        id: '1',
        text: 'Merhaba! ModaBase\'e hoş geldiniz. Size nasıl yardımcı olabilirim?',
        sender: 'agent',
        timestamp: new Date()
      }
    ],
    currentMessage: '',
    conversation: null,
    isLoading: false,
    isConnected: false,
    unreadCount: 0
  })
  
  const chatRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatState.messages])
  
  // Focus input when chat opens
  useEffect(() => {
    if (chatState.isOpen && !chatState.isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [chatState.isOpen, chatState.isMinimized])
  
  const toggleChat = () => {
    setChatState(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
      isMinimized: false
    }))
  }
  
  const toggleMinimize = () => {
    setChatState(prev => ({
      ...prev,
      isMinimized: !prev.isMinimized
    }))
  }
  
  const sendMessage = () => {
    if (!chatState.currentMessage.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: chatState.currentMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      currentMessage: '',
      isTyping: true
    }))

    // Simulate agent response
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Mesajınız alınmıştır. Müşteri temsilcimiz en kısa sürede size dönüş yapacaktır.',
        sender: 'agent',
        timestamp: new Date()
      }

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, agentResponse],
        isTyping: false
      }))
    }, 2000)
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  
  // Mobile detection
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Toggle Button - Mobile optimized */}
      {!chatState.isOpen && (
        <button
          onClick={toggleChat}
          className="group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
          style={{
            width: isMobile ? '56px' : '60px',
            height: isMobile ? '56px' : '60px',
          }}
          aria-label="Canlı destek"
        >
          <MessageCircle 
            size={isMobile ? 24 : 28} 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
          />
          
          {/* Notification pulse */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
            <span className="text-xs text-white font-bold">1</span>
          </div>
          
          {/* Mobile tooltip */}
          {!isMobile && (
            <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Canlı Destek
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
            </div>
          )}
        </button>
      )}
      
      {/* Chat Window - Mobile responsive */}
      {chatState.isOpen && (
        <div
          ref={chatRef}
          className={`bg-white rounded-lg shadow-2xl border transition-all duration-300 flex flex-col ${
            isMobile 
              ? (chatState.isMinimized ? 'w-80 h-14' : 'w-screen h-screen fixed inset-0 bottom-0 right-0 rounded-none') 
              : (chatState.isMinimized ? 'w-80 h-14' : 'w-80 h-[500px]')
          }`}
          style={{
            maxWidth: isMobile ? '100vw' : '320px',
            maxHeight: isMobile ? '100vh' : '500px',
          }}
        >
          {/* Header - Mobile optimized */}
          <div className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white ${isMobile ? 'p-4' : 'p-4'} ${isMobile && !chatState.isMinimized ? 'rounded-none' : 'rounded-t-lg'} flex items-center justify-between`}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <MessageCircle size={isMobile ? 24 : 20} />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className={`font-semibold ${isMobile ? 'text-lg' : 'text-base'}`}>Canlı Destek</h3>
                <p className={`${isMobile ? 'text-sm' : 'text-xs'} opacity-90`}>Online • Yanıtlıyoruz</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isMobile && (
                <button
                  onClick={toggleMinimize}
                  className="hover:bg-blue-600 p-2 rounded-lg transition-colors"
                  aria-label={chatState.isMinimized ? "Büyüt" : "Küçült"}
                >
                  {chatState.isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
              )}
              <button
                onClick={toggleChat}
                className="hover:bg-blue-600 p-2 rounded-lg transition-colors"
                aria-label="Kapat"
              >
                <X size={isMobile ? 20 : 16} />
              </button>
            </div>
          </div>
          
          {/* Chat Content - Only show when not minimized */}
          {!chatState.isMinimized && (
            <>
              {/* Quick Actions - Mobile optimized */}
              {!isMobile && (
                <div className="p-3 bg-gray-50 border-b">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button className="flex items-center justify-center space-x-1 p-2 bg-white rounded border hover:bg-gray-50 transition-colors">
                      <Phone size={12} />
                      <span>Ara</span>
                    </button>
                    <button className="flex items-center justify-center space-x-1 p-2 bg-white rounded border hover:bg-gray-50 transition-colors">
                      <Mail size={12} />
                      <span>Email</span>
                    </button>
                    <button className="flex items-center justify-center space-x-1 p-2 bg-white rounded border hover:bg-gray-50 transition-colors">
                      <Clock size={12} />
                      <span>Saatler</span>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Messages Area - Mobile optimized */}
              <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-4' : 'p-3'} space-y-3`} style={{ maxHeight: isMobile ? 'calc(100vh - 140px)' : '300px' }}>
                {chatState.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${isMobile ? 'max-w-[85%]' : ''}`}>
                      <div
                        className={`${isMobile ? 'p-3 text-base' : 'p-2 text-sm'} rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {message.text}
                      </div>
                      <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {chatState.isTyping && (
                  <div className="flex justify-start">
                    <div className={`${isMobile ? 'p-3' : 'p-2'} bg-gray-100 rounded-2xl`}>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area - Mobile optimized */}
              <div className={`border-t bg-white ${isMobile ? 'p-4 pb-safe' : 'p-3'} ${isMobile ? 'rounded-none' : 'rounded-b-lg'}`}>
                <div className="flex items-end space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={chatState.currentMessage}
                    onChange={(e) => setChatState(prev => ({ ...prev, currentMessage: e.target.value }))}
                    onKeyPress={handleKeyPress}
                    placeholder="Mesajınızı yazın..."
                    className={`flex-1 ${isMobile ? 'p-3 text-base' : 'p-2 text-sm'} border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                    style={{ minHeight: isMobile ? '44px' : '36px' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!chatState.currentMessage.trim()}
                    className={`${isMobile ? 'w-12 h-12' : 'w-10 h-10'} bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0`}
                    aria-label="Gönder"
                  >
                    <Send size={isMobile ? 20 : 16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default LiveChat
