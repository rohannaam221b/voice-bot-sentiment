# API Endpoints Reference

## Authentication Endpoints

### POST /auth/login
Authenticate user and get access token.

**Request:**
```json
{
  "email": "agent@bank.com",
  "password": "secure_password",
  "role": "AGENT"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "user": {
      "id": "user_123",
      "email": "agent@bank.com",
      "role": "AGENT",
      "permissions": ["VIEW_CUSTOMERS", "CREATE_TICKETS"]
    }
  }
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

### POST /auth/logout
Invalidate current session.

**Headers:** `Authorization: Bearer <token>`

---

## Customer Endpoints

### GET /customers/{customerId}
Get customer details by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cust_123",
    "name": "John Doe",
    "email": "john.doe@email.com",
    "phone": "+1234567890",
    "accountNumber": "ACC001234567",
    "accountType": "SAVINGS",
    "balance": 5000.00,
    "status": "ACTIVE",
    "joinDate": "2020-01-15T00:00:00Z",
    "riskLevel": "LOW",
    "preferredLanguage": "en",
    "lastTransactionDate": "2024-01-14T15:30:00Z",
    "kycStatus": "VERIFIED"
  }
}
```

### GET /customers/search
Search customers by various criteria.

**Query Parameters:**
- `q` (string): Search query
- `phone` (string): Phone number
- `email` (string): Email address
- `accountNumber` (string): Account number
- `limit` (number): Results limit (default: 20)
- `offset` (number): Results offset (default: 0)

**Example:** `GET /customers/search?phone=+1234567890&limit=10`

### PUT /customers/{customerId}
Update customer information.

**Request:**
```json
{
  "email": "newemail@example.com",
  "phone": "+1234567891",
  "preferredLanguage": "es"
}
```

---

## Conversation Endpoints

### POST /conversations
Start a new conversation.

**Request:**
```json
{
  "customerId": "cust_123",
  "channel": "VOICE",
  "agentId": "agent_456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conv_789",
    "customerId": "cust_123",
    "status": "ACTIVE",
    "startTime": "2024-01-15T10:00:00Z",
    "channel": "VOICE",
    "agentId": "agent_456"
  }
}
```

### GET /conversations/{conversationId}
Get conversation details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conv_789",
    "customerId": "cust_123",
    "status": "ACTIVE",
    "startTime": "2024-01-15T10:00:00Z",
    "duration": 300,
    "channel": "VOICE",
    "agentId": "agent_456",
    "overallSentiment": "neutral",
    "resolutionStatus": "PENDING",
    "tags": ["account_inquiry", "balance_check"]
  }
}
```

### PUT /conversations/{conversationId}/status
Update conversation status.

**Request:**
```json
{
  "status": "ENDED",
  "summary": "Customer inquiry about account balance resolved",
  "resolutionStatus": "RESOLVED"
}
```

### GET /conversations/active
Get all active conversations.

**Query Parameters:**
- `agentId` (string): Filter by agent
- `limit` (number): Results limit
- `offset` (number): Results offset

---

## Message Endpoints

### POST /conversations/{conversationId}/messages
Add a new message to conversation.

**Request:**
```json
{
  "speaker": "customer",
  "content": "I need help with my recent transaction",
  "timestamp": "2024-01-15T10:05:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "msg_123",
    "conversationId": "conv_789",
    "speaker": "customer",
    "content": "I need help with my recent transaction",
    "timestamp": "2024-01-15T10:05:00Z",
    "sentiment": "neutral",
    "confidence": 0.75
  }
}
```

### GET /conversations/{conversationId}/messages
Get messages for a conversation.

**Query Parameters:**
- `limit` (number): Results limit (default: 50)
- `offset` (number): Results offset
- `since` (string): ISO timestamp to get messages after

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg_123",
        "speaker": "customer",
        "content": "I need help with my recent transaction",
        "timestamp": "2024-01-15T10:05:00Z",
        "sentiment": "neutral",
        "confidence": 0.75
      }
    ],
    "totalCount": 15,
    "hasMore": true
  }
}
```

---

## Sentiment Analysis Endpoints

### POST /sentiment/analyze
Analyze sentiment of text.

**Request:**
```json
{
  "text": "I'm really frustrated with this service",
  "conversationId": "conv_789",
  "messageId": "msg_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sentiment": "negative",
    "confidence": 0.89,
    "emotions": {
      "joy": 0.05,
      "anger": 0.78,
      "fear": 0.12,
      "sadness": 0.45,
      "surprise": 0.03,
      "disgust": 0.23
    },
    "keywords": ["frustrated", "service"],
    "riskScore": 0.67,
    "escalationRequired": true
  }
}
```

### GET /sentiment/conversation/{conversationId}
Get sentiment analysis for entire conversation.

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "conv_789",
    "overallSentiment": "negative",
    "sentimentTrend": [
      {
        "timestamp": "2024-01-15T10:00:00Z",
        "sentiment": "neutral",
        "confidence": 0.8
      },
      {
        "timestamp": "2024-01-15T10:05:00Z",
        "sentiment": "negative",
        "confidence": 0.89
      }
    ],
    "averageRiskScore": 0.45,
    "escalationTriggered": true
  }
}
```

### GET /sentiment/analytics
Get sentiment analytics for dashboard.

**Query Parameters:**
- `period` (string): 'day', 'week', 'month' (default: 'day')
- `agentId` (string): Filter by agent
- `startDate` (string): ISO date
- `endDate` (string): ISO date

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalConversations": 150,
      "positivePercentage": 65.5,
      "neutralPercentage": 25.2,
      "negativePercentage": 9.3,
      "averageRiskScore": 0.23
    },
    "trends": [
      {
        "date": "2024-01-15",
        "positive": 45,
        "neutral": 20,
        "negative": 8
      }
    ],
    "topIssues": [
      {
        "category": "TRANSACTION",
        "count": 25,
        "avgSentiment": "negative"
      }
    ]
  }
}
```

---

## Ticket Management Endpoints

### POST /tickets
Create a new ticket.

**Request:**
```json
{
  "conversationId": "conv_789",
  "customerId": "cust_123",
  "title": "Failed UPI Transaction",
  "description": "Customer reported failed UPI transaction with money deducted",
  "category": "TRANSACTION",
  "priority": "HIGH",
  "tags": ["upi", "refund", "urgent"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "TKT-2024-0001",
    "conversationId": "conv_789",
    "customerId": "cust_123",
    "title": "Failed UPI Transaction",
    "description": "Customer reported failed UPI transaction with money deducted",
    "category": "TRANSACTION",
    "priority": "HIGH",
    "status": "OPEN",
    "createdAt": "2024-01-15T10:30:00Z",
    "slaDeadline": "2024-01-15T14:30:00Z",
    "tags": ["upi", "refund", "urgent"]
  }
}
```

### GET /tickets
Get tickets with filtering and pagination.

**Query Parameters:**
- `status` (string): Filter by status
- `priority` (string): Filter by priority
- `category` (string): Filter by category
- `assignedTo` (string): Filter by assigned agent
- `customerId` (string): Filter by customer
- `limit` (number): Results limit
- `offset` (number): Results offset
- `sortBy` (string): Sort field
- `sortOrder` (string): 'asc' or 'desc'

### GET /tickets/{ticketId}
Get ticket details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "TKT-2024-0001",
    "conversationId": "conv_789",
    "customerId": "cust_123",
    "title": "Failed UPI Transaction",
    "description": "Customer reported failed UPI transaction with money deducted",
    "category": "TRANSACTION",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "assignedTo": "agent_456",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:00:00Z",
    "slaDeadline": "2024-01-15T14:30:00Z",
    "tags": ["upi", "refund", "urgent"],
    "attachments": [
      {
        "id": "att_123",
        "filename": "transaction_screenshot.png",
        "url": "https://files.bank.com/att_123",
        "type": "image/png"
      }
    ]
  }
}
```

### PUT /tickets/{ticketId}
Update ticket.

**Request:**
```json
{
  "status": "RESOLVED",
  "assignedTo": "agent_789",
  "resolutionNotes": "Refund processed successfully",
  "priority": "MEDIUM"
}
```

### POST /tickets/{ticketId}/comments
Add comment to ticket.

**Request:**
```json
{
  "content": "Contacted payment gateway, refund will be processed within 24 hours",
  "isInternal": false
}
```

### GET /tickets/analytics
Get ticket analytics for dashboard.

**Query Parameters:**
- `period` (string): 'day', 'week', 'month'
- `agentId` (string): Filter by agent

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTickets": 89,
      "openTickets": 23,
      "resolvedToday": 15,
      "overdueTickets": 3,
      "avgResolutionTime": 4.5
    },
    "byPriority": {
      "CRITICAL": 2,
      "HIGH": 8,
      "MEDIUM": 35,
      "LOW": 44
    },
    "byCategory": {
      "TRANSACTION": 25,
      "ACCOUNT": 18,
      "CARD": 15,
      "TECHNICAL": 12,
      "COMPLAINT": 19
    },
    "trends": [
      {
        "date": "2024-01-15",
        "created": 12,
        "resolved": 8
      }
    ]
  }
}
```

---

## Dashboard Analytics Endpoints

### GET /dashboard/summary
Get dashboard summary statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "activeConversations": 15,
    "totalCallsToday": 89,
    "avgCallDuration": 4.2,
    "customerSatisfaction": 4.3,
    "sentimentScore": 0.75,
    "ticketsCreated": 12,
    "ticketsResolved": 8,
    "agentsOnline": 25
  }
}
```

### GET /dashboard/realtime-metrics
Get real-time dashboard metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-15T10:30:00Z",
    "activeConversations": 15,
    "averageWaitTime": 2.3,
    "currentSentiment": {
      "positive": 65,
      "neutral": 25,
      "negative": 10
    },
    "systemHealth": {
      "voiceService": "healthy",
      "sentimentService": "healthy",
      "database": "healthy"
    }
  }
}
```

---

## Voice Processing Endpoints

### POST /voice/transcribe
Transcribe audio to text.

**Request:** Multipart form with audio file
```
Content-Type: multipart/form-data
- audio: <audio_file>
- conversationId: conv_789
- speaker: customer
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transcript": "I need help with my account balance",
    "confidence": 0.92,
    "language": "en",
    "duration": 3.5
  }
}
```

### POST /voice/synthesize
Convert text to speech.

**Request:**
```json
{
  "text": "Thank you for calling. How can I help you today?",
  "voice": "en-US-Neural",
  "speed": 1.0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "audioUrl": "https://audio.bank.com/speech_123.wav",
    "duration": 2.8
  }
}
```

---

## WebSocket Connection

### Connection URL
```
wss://ws.yourbank.com/conversations/{conversationId}?token=<jwt_token>
```

### Supported Events

#### Client → Server

**Join Conversation:**
```json
{
  "type": "join_conversation",
  "data": {
    "conversationId": "conv_789",
    "agentId": "agent_456"
  }
}
```

**Send Message:**
```json
{
  "type": "send_message",
  "data": {
    "content": "How can I help you?",
    "speaker": "ai"
  }
}
```

**Voice Activity:**
```json
{
  "type": "voice_activity",
  "data": {
    "isActive": true,
    "speaker": "customer",
    "audioLevel": 0.8
  }
}
```

#### Server → Client

**Message Received:**
```json
{
  "type": "message_received",
  "data": {
    "id": "msg_123",
    "content": "I need help with my transaction",
    "speaker": "customer",
    "timestamp": "2024-01-15T10:30:00Z",
    "sentiment": "neutral"
  }
}
```

**Sentiment Update:**
```json
{
  "type": "sentiment_update",
  "data": {
    "messageId": "msg_123",
    "sentiment": "negative",
    "confidence": 0.85,
    "riskScore": 0.67
  }
}
```

**Call Status:**
```json
{
  "type": "call_status",
  "data": {
    "status": "SPEAKING",
    "speaker": "ai",
    "duration": 120
  }
}
```

---

## Health Check Endpoints

### GET /health
Basic health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### GET /health/detailed
Detailed health check with service status.

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "voiceService": "healthy",
    "sentimentService": "degraded"
  },
  "version": "1.0.0",
  "uptime": 86400
}
```