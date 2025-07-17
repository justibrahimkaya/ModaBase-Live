'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  MessageCircle, 
  Send, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  RefreshCw,
  UserCheck,
  Mail
} from 'lucide-react'

interface Message {
  id: string
  senderId: string | null
  senderType: 'user' | 'admin' | 'system'
  content: string
  messageType: 'text' | 'image' | 'file' | 'system'
  isRead: boolean
  readAt?: Date
  createdAt: Date
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
  lastMessageAt: Date
  createdAt: Date
  messages: Message[]
}

export default function AdminChatPage() {
  // Hooks - her zaman aynı sırada
  const { data: session, status } = useSession()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // State - tüm state'leri ayrı ayrı tanımlıyorum
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed' | 'pending'>('all')
  const [mounted, setMounted] = useState(false)

  // Mount kontrolü
  useEffect(() => {
    setMounted(true)
  }, [])

  // Session ve admin kontrolü
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/admin/login')
      return
    }

    // Admin yetkisi kontrolü
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/admin/profile')
        if (!response.ok) {
          router.push('/admin/login')
          return
        }
        setLoading(false)
      } catch (error) {
        console.error('Admin check failed:', error)
        router.push('/admin/login')
      }
    }

    checkAdmin()
  }, [session, status, router])

  // Konuşmaları yükle
  const loadConversations = async () => {
    if (!session?.user) return
    
    try {
      setError(null)
      const params = new URLSearchParams({
        page: '1',
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      })
      
      const response = await fetch(`/api/chat?${params}`)
      
      if (response.status === 401 || response.status === 403) {
        router.push('/admin/login')
        return
      }
      
      const data = await response.json()
      
      if (response.ok) {
        setConversations(data.conversations || [])
      } else {
        setError(data.error || 'Konuşmalar yüklenemedi')
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    }
  }

  // Konuşmaları yükle - effect
  useEffect(() => {
    if (!loading && session?.user) {
      loadConversations()
    }
  }, [loading, session?.user, statusFilter, searchTerm])

  // Konuşma seç
  const selectConversation = async (conversation: Conversation) => {
    if (!session?.user) return
    
    try {
      setMessagesLoading(true)
      setSelectedConversation(conversation)
      
      const response = await fetch(`/api/chat/${conversation.id}`)
      
      if (response.status === 401 || response.status === 403) {
        router.push('/admin/login')
        return
      }
      
      const data = await response.json()
      
      if (response.ok) {
        setMessages(data.messages || [])
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else {
        console.error('Failed to load messages:', data.error)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setMessagesLoading(false)
    }
  }

  // Mesaj gönder
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !session?.user) return
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage.trim(),
          messageType: 'text'
        })
      })
      
      if (response.status === 401 || response.status === 403) {
        router.push('/admin/login')
        return
      }
      
      const data = await response.json()
      
      if (response.ok) {
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else {
        console.error('Failed to send message:', data.error)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Konuşma durumunu güncelle
  const updateConversationStatus = async (conversationId: string, status: string) => {
    if (!session?.user) return
    
    try {
      const response = await fetch(`/api/chat/${conversationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (response.status === 401 || response.status === 403) {
        router.push('/admin/login')
        return
      }
      
      if (response.ok) {
        loadConversations()
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(prev => 
            prev ? { ...prev, status: status as any } : null
          )
        }
      }
    } catch (error) {
      console.error('Error updating conversation status:', error)
    }
  }

  // Enter ile mesaj gönder
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Zaman formatı
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Öncelik rengi
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Durum rengi
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Mount kontrolü
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Session yükleniyor
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Session yok
  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Canlı Destek Yönetimi</h1>
                <p className="text-gray-600">Müşteri destek konuşmalarını yönetin</p>
              </div>
            </div>
            <button
              onClick={loadConversations}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={16} />
              <span>Yenile</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Filters */}
              <div className="p-4 border-b">
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Konuşma ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tüm Durumlar</option>
                    <option value="active">Aktif</option>
                    <option value="pending">Bekleyen</option>
                    <option value="closed">Kapalı</option>
                  </select>
                </div>
              </div>

              {/* Conversations */}
              <div className="max-h-96 overflow-y-auto">
                {error ? (
                  <div className="text-center py-8 text-red-500">
                    <AlertCircle size={48} className="mx-auto mb-4 text-red-300" />
                    <p className="text-sm font-medium">{error}</p>
                    <button
                      onClick={loadConversations}
                      className="mt-2 text-xs text-blue-500 hover:text-blue-700"
                    >
                      Tekrar Dene
                    </button>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-sm font-medium">Henüz konuşma bulunamadı</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Müşteriler canlı destek başlattığında burada görünecek
                    </p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => selectConversation(conversation)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">
                              {conversation.isGuest ? conversation.guestName : 'Kayıtlı Kullanıcı'}
                            </span>
                            {conversation.isGuest && <UserCheck size={14} className="text-gray-400" />}
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{conversation.subject}</p>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(conversation.status)}`}>
                              {conversation.status}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(conversation.priority)}`}>
                              {conversation.priority}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessageAt)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            {selectedConversation ? (
              <div className="bg-white rounded-lg shadow-sm h-96 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        {selectedConversation.isGuest ? (
                          <Mail className="h-5 w-5 text-white" />
                        ) : (
                          <User className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {selectedConversation.isGuest 
                            ? selectedConversation.guestName 
                            : 'Kayıtlı Kullanıcı'}
                        </h3>
                        <p className="text-sm text-gray-600">{selectedConversation.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateConversationStatus(selectedConversation.id, 'closed')}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200 transition-colors"
                      >
                        Kapat
                      </button>
                      <button
                        onClick={() => updateConversationStatus(selectedConversation.id, 'active')}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200 transition-colors"
                      >
                        Aktif
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                              message.senderType === 'admin' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-white text-gray-900 border'
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              {message.senderType !== 'admin' && (
                                <User size={16} className="mt-0.5 flex-shrink-0" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm">{message.content}</p>
                                <div className="flex items-center justify-between mt-1 text-xs opacity-70">
                                  <span>{formatTime(message.createdAt)}</span>
                                  {message.senderType === 'admin' && (
                                    <div className="flex items-center space-x-1">
                                      {message.isRead ? (
                                        <CheckCircle2 size={12} />
                                      ) : (
                                        <Clock size={12} />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t bg-white rounded-b-lg">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Yanıtınızı yazın..."
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Bir konuşma seçin</p>
                  <p className="text-sm">Müşteri desteği başlatmak için sol panelden bir konuşma seçin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
