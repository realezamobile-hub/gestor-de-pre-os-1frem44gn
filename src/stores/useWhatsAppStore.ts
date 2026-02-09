import { create } from 'zustand'
import { WhatsAppConversation, WhatsAppMessage } from '@/types'

interface WhatsAppState {
  isConnected: boolean
  isConnecting: boolean
  conversations: WhatsAppConversation[]
  activeConversationId: string | null
  messages: Record<string, WhatsAppMessage[]>

  connect: () => Promise<void>
  disconnect: () => void
  selectConversation: (id: string) => void
  sendMessage: (text: string, agentName: string) => void
  simulateIncomingMessage: () => void
  markAsRead: (conversationId: string) => void
}

// Mock Data
const MOCK_CONVERSATIONS: WhatsAppConversation[] = [
  {
    id: '1',
    contactName: 'Cliente João Silva',
    contactNumber: '+55 11 99999-1111',
    unreadCount: 2,
    isOnline: true,
    lastMessage: {
      id: 'm1',
      text: 'Olá, gostaria de saber o preço do iPhone 13.',
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 30), // 30s ago
      status: 'read',
    },
  },
  {
    id: '2',
    contactName: 'Maria Oliveira',
    contactNumber: '+55 11 98888-2222',
    unreadCount: 0,
    lastMessage: {
      id: 'm2',
      text: 'Obrigado pelo atendimento!',
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
      status: 'read',
    },
  },
  {
    id: '3',
    contactName: 'Fornecedor Tech',
    contactNumber: '+55 11 97777-3333',
    unreadCount: 0,
    lastMessage: {
      id: 'm3',
      text: 'Pedido confirmado. Enviaremos amanhã.',
      sender: 'me',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      status: 'read',
      agentName: 'Admin',
    },
  },
  {
    id: '4',
    contactName: 'Pedro Souza',
    contactNumber: '+55 11 96666-4444',
    unreadCount: 1,
    lastMessage: {
      id: 'm4',
      text: 'Tem garantia de quanto tempo?',
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 120), // 2 mins ago (Should Trigger Alert)
      status: 'delivered',
    },
  },
]

const MOCK_MESSAGES: Record<string, WhatsAppMessage[]> = {
  '1': [
    {
      id: 'msg-1-1',
      text: 'Bom dia! Vocês tem iPhone 13?',
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 120),
      status: 'read',
    },
    {
      id: 'msg-1-2',
      text: 'Olá, gostaria de saber o preço do iPhone 13.',
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 30),
      status: 'read',
    },
  ],
  '2': [
    {
      id: 'msg-2-1',
      text: 'Obrigado pelo atendimento!',
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      status: 'read',
    },
  ],
  '3': [],
  '4': [
    {
      id: 'msg-4-1',
      text: 'Tem garantia de quanto tempo?',
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 120),
      status: 'delivered',
    },
  ],
}

export const useWhatsAppStore = create<WhatsAppState>((set, get) => ({
  isConnected: false,
  isConnecting: false,
  conversations: MOCK_CONVERSATIONS,
  activeConversationId: null,
  messages: MOCK_MESSAGES,

  connect: async () => {
    set({ isConnecting: true })
    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 2000))
    set({ isConnected: true, isConnecting: false })
  },

  disconnect: () => {
    set({ isConnected: false, activeConversationId: null })
  },

  selectConversation: (id) => {
    set({ activeConversationId: id })
    get().markAsRead(id)
  },

  markAsRead: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c,
      ),
    }))
  },

  sendMessage: (text, agentName) => {
    const { activeConversationId, messages, conversations } = get()
    if (!activeConversationId) return

    // Auto-attribution signature
    const signature = `\n\nAttended by: ${agentName}`
    const fullText = `${text}${signature}`

    const newMessage: WhatsAppMessage = {
      id: Date.now().toString(),
      text: fullText,
      sender: 'me',
      timestamp: new Date(),
      status: 'sent',
      agentName,
    }

    const updatedMessages = {
      ...messages,
      [activeConversationId]: [
        ...(messages[activeConversationId] || []),
        newMessage,
      ],
    }

    const updatedConversations = conversations
      .map((c) => {
        if (c.id === activeConversationId) {
          return {
            ...c,
            lastMessage: newMessage,
            unreadCount: 0,
          }
        }
        return c
      })
      .sort((a, b) => {
        // Move active to top
        if (a.id === activeConversationId) return -1
        if (b.id === activeConversationId) return 1
        return 0
      })

    set({
      messages: updatedMessages,
      conversations: updatedConversations,
    })

    // Simulate tick to delivered/read
    setTimeout(() => {
      set((state) => ({
        messages: {
          ...state.messages,
          [activeConversationId]: state.messages[activeConversationId].map(
            (m) => (m.id === newMessage.id ? { ...m, status: 'delivered' } : m),
          ),
        },
      }))
    }, 1000)
  },

  simulateIncomingMessage: () => {
    const { conversations, messages } = get()
    const targetId = conversations[0].id // Target first conversation

    const newMessage: WhatsAppMessage = {
      id: Date.now().toString(),
      text: 'Olá? Alguém pode me ajudar?',
      sender: 'other',
      timestamp: new Date(),
      status: 'delivered',
    }

    const updatedMessages = {
      ...messages,
      [targetId]: [...(messages[targetId] || []), newMessage],
    }

    const updatedConversations = conversations
      .map((c) => {
        if (c.id === targetId) {
          return {
            ...c,
            lastMessage: newMessage,
            unreadCount: c.unreadCount + 1,
          }
        }
        return c
      })
      .sort((a, b) => {
        // Move to top
        if (a.id === targetId) return -1
        if (b.id === targetId) return 1
        return 0
      })

    set({
      messages: updatedMessages,
      conversations: updatedConversations,
    })
  },
}))
