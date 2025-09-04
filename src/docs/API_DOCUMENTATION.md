# Voice Bot Dashboard - API Documentation

## Overview

This document provides comprehensive API documentation for integrating real backend services with the Voice Bot Dashboard for banking operations. The dashboard requires real-time voice interactions, sentiment analysis, customer data management, and ticket generation capabilities.

## Base Configuration

### Environment Variables
```bash
REACT_APP_API_BASE_URL=https://api.yourbank.com/v1
REACT_APP_WEBSOCKET_URL=wss://ws.yourbank.com
REACT_APP_API_KEY=your_api_key_here
REACT_APP_ENVIRONMENT=production|staging|development
```

### Authentication

All API requests require Bearer token authentication:

```http
Authorization: Bearer <jwt_token>
```

### Common Response Format

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_1234567890"
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Detailed error message",
    "details": {}
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_1234567890"
}
```

## Data Models

### Customer Model
```typescript
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountNumber: string;
  accountType: 'SAVINGS' | 'CURRENT' | 'CREDIT';
  balance: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  joinDate: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  preferredLanguage: string;
  lastTransactionDate: string;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}
```

### Message Model
```typescript
interface Message {
  id: string;
  conversationId: string;
  speaker: 'customer' | 'ai';
  content: string;
  timestamp: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  confidence?: number;
  emotions?: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
  };
  intent?: string;
  entities?: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
}
```

### Conversation Model
```typescript
interface Conversation {
  id: string;
  customerId: string;
  status: 'ACTIVE' | 'ENDED' | 'TRANSFERRED';
  startTime: string;
  endTime?: string;
  duration?: number;
  channel: 'VOICE' | 'CHAT' | 'VIDEO';
  agentId?: string;
  summary?: string;
  overallSentiment: 'positive' | 'neutral' | 'negative';
  resolutionStatus: 'RESOLVED' | 'PENDING' | 'ESCALATED';
  tags: string[];
}
```

### Ticket Model
```typescript
interface Ticket {
  id: string;
  conversationId: string;
  customerId: string;
  title: string;
  description: string;
  category: 'TRANSACTION' | 'ACCOUNT' | 'CARD' | 'LOAN' | 'TECHNICAL' | 'COMPLAINT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  slaDeadline: string;
  tags: string[];
  attachments?: Array<{
    id: string;
    filename: string;
    url: string;
    type: string;
  }>;
}
```

### Sentiment Analysis Model
```typescript
interface SentimentAnalysis {
  id: string;
  messageId: string;
  conversationId: string;
  timestamp: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  emotions: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
    disgust: number;
  };
  keywords: string[];
  riskScore: number;
  escalationRequired: boolean;
}
```

## WebSocket Events

### Connection
```javascript
const ws = new WebSocket('wss://ws.yourbank.com?token=jwt_token');
```

### Event Types

#### Voice Activity
```json
{
  "type": "voice_activity",
  "data": {
    "conversationId": "conv_123",
    "isActive": true,
    "speaker": "customer",
    "audioLevel": 0.8
  }
}
```

#### Real-time Message
```json
{
  "type": "new_message",
  "data": {
    "message": {
      "id": "msg_123",
      "conversationId": "conv_123",
      "speaker": "customer",
      "content": "I need help with my transaction",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### Sentiment Update
```json
{
  "type": "sentiment_update",
  "data": {
    "conversationId": "conv_123",
    "messageId": "msg_123",
    "sentiment": "negative",
    "confidence": 0.85,
    "emotions": {
      "anger": 0.7,
      "frustration": 0.6
    }
  }
}
```

#### Call Status Change
```json
{
  "type": "call_status",
  "data": {
    "conversationId": "conv_123",
    "status": "SPEAKING",
    "currentSpeaker": "ai",
    "duration": 120
  }
}
```

## Real-time Integration Requirements

### Voice Processing Pipeline
1. **Audio Stream Processing**: Continuous audio streaming via WebSocket
2. **Speech-to-Text**: Real-time transcription with confidence scores
3. **Intent Recognition**: NLU processing for banking intents
4. **Response Generation**: AI-powered response generation
5. **Text-to-Speech**: Natural voice synthesis for AI responses

### Sentiment Analysis Pipeline
1. **Real-time Processing**: Sub-second sentiment analysis
2. **Emotion Detection**: Multi-class emotion classification
3. **Risk Assessment**: Automated escalation triggers
4. **Trend Analysis**: Historical sentiment tracking

### Required Integrations
- **Voice/Speech Services**: Azure Speech, Google Cloud Speech, or AWS Transcribe
- **NLP Services**: OpenAI GPT, Azure Cognitive Services, or custom models
- **Sentiment Analysis**: AWS Comprehend, Google Cloud Natural Language, or custom ML models
- **Customer Database**: Core banking system integration
- **Ticket Management**: ServiceNow, Jira, or custom ticketing system

## Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 10 requests | 1 minute |
| Customer Data | 100 requests | 1 minute |
| Conversations | 200 requests | 1 minute |
| Messages | 500 requests | 1 minute |
| Sentiment Analysis | 1000 requests | 1 minute |
| Tickets | 100 requests | 1 minute |
| WebSocket Connections | 10 connections | Per user |

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| AUTH_REQUIRED | Authentication required | 401 |
| AUTH_INVALID | Invalid authentication token | 401 |
| FORBIDDEN | Insufficient permissions | 403 |
| NOT_FOUND | Resource not found | 404 |
| VALIDATION_ERROR | Request validation failed | 400 |
| RATE_LIMITED | Rate limit exceeded | 429 |
| SERVER_ERROR | Internal server error | 500 |
| SERVICE_UNAVAILABLE | Service temporarily unavailable | 503 |

## Security Considerations

### Data Protection
- All customer data must be encrypted in transit and at rest
- PII should be masked in logs and non-production environments
- Implement data retention policies per banking regulations

### Access Control
- Role-based access control (RBAC) for different user types
- Session management with automatic timeout
- Audit logging for all customer data access

### Compliance
- PCI DSS compliance for payment card data
- GDPR compliance for EU customers
- SOX compliance for financial reporting
- Local banking regulations compliance

## Performance Requirements

### Latency Targets
- Voice transcription: < 200ms
- Sentiment analysis: < 100ms
- Customer data retrieval: < 500ms
- Ticket creation: < 1s
- WebSocket message delivery: < 50ms

### Availability
- 99.9% uptime requirement
- Graceful degradation during maintenance
- Circuit breaker patterns for external services
- Health check endpoints for monitoring

## Monitoring and Logging

### Required Metrics
- API response times
- Error rates by endpoint
- WebSocket connection counts
- Sentiment analysis accuracy
- Customer satisfaction scores

### Logging Requirements
- Structured logging in JSON format
- Request/response correlation IDs
- Customer interaction audit trails
- Performance metrics logging
- Security event logging

## Testing Requirements

### Unit Tests
- API endpoint validation
- Data model serialization
- Business logic validation
- Error handling scenarios

### Integration Tests
- End-to-end conversation flows
- Real-time sentiment analysis
- Ticket generation workflows
- Customer data synchronization

### Load Testing
- Concurrent user scenarios
- WebSocket connection scaling
- Database performance under load
- Third-party service integration resilience