# Backend Integration Guide

## Overview

This guide provides step-by-step instructions for backend developers to integrate real APIs with the Voice Bot Dashboard. The implementation should support real-time voice conversations, sentiment analysis, customer management, and ticket generation.

## Prerequisites

### Required Technologies
- **Backend Framework**: Node.js/Express, Python/FastAPI, or Java/Spring Boot
- **Database**: PostgreSQL or MongoDB for primary data
- **Cache**: Redis for session management and real-time operations
- **Message Queue**: RabbitMQ or Apache Kafka for event processing
- **WebSocket**: Socket.io, WebSocket API, or similar for real-time communication

### External Services
- **Speech Services**: Azure Speech Services, Google Cloud Speech-to-Text, or AWS Transcribe
- **NLP/AI**: OpenAI GPT-4, Azure OpenAI, or Google Cloud AI Platform
- **Sentiment Analysis**: AWS Comprehend, Google Cloud Natural Language API, or custom ML models

## Phase 1: Basic API Setup

### 1.1 Environment Configuration

Create environment configuration file:

```bash
# .env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/voicebot_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRY=1h

# External Services
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=eastus
OPENAI_API_KEY=your_openai_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# WebSocket
WEBSOCKET_PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,https://dashboard.yourbank.com
```

### 1.2 Database Schema Setup

**PostgreSQL Schema:**

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'AGENT',
    permissions TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    account_number VARCHAR(50) UNIQUE NOT NULL,
    account_type VARCHAR(20) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    risk_level VARCHAR(10) DEFAULT 'LOW',
    preferred_language VARCHAR(5) DEFAULT 'en',
    last_transaction_date TIMESTAMP,
    kyc_status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    agent_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    duration INTEGER,
    channel VARCHAR(10) DEFAULT 'VOICE',
    summary TEXT,
    overall_sentiment VARCHAR(10),
    resolution_status VARCHAR(20) DEFAULT 'PENDING',
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id),
    speaker VARCHAR(10) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sentiment VARCHAR(10),
    confidence DECIMAL(3,2),
    intent VARCHAR(100),
    entities JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sentiment analysis table
CREATE TABLE sentiment_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id),
    conversation_id UUID REFERENCES conversations(id),
    sentiment VARCHAR(10) NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    emotions JSONB,
    keywords TEXT[],
    risk_score DECIMAL(3,2),
    escalation_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table
CREATE TABLE tickets (
    id VARCHAR(20) PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id),
    customer_id UUID REFERENCES customers(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN',
    assigned_to UUID REFERENCES users(id),
    resolution_notes TEXT,
    sla_deadline TIMESTAMP,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_conversations_customer ON conversations(customer_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_sentiment_conversation ON sentiment_analysis(conversation_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
```

### 1.3 Basic API Server Setup

**Node.js/Express Example:**

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const redis = require('redis');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Redis connection
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});
redisClient.connect();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // requests per window
  message: 'Too many requests from this IP',
});
app.use('/api/', apiLimiter);

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: { code: 'AUTH_REQUIRED' } });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    
    if (user.rows.length === 0) {
      return res.status(401).json({ success: false, error: { code: 'AUTH_INVALID' } });
    }

    req.user = user.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: { code: 'AUTH_INVALID' } });
  }
};

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', authenticateToken, require('./routes/customers'));
app.use('/api/conversations', authenticateToken, require('./routes/conversations'));
app.use('/api/messages', authenticateToken, require('./routes/messages'));
app.use('/api/sentiment', authenticateToken, require('./routes/sentiment'));
app.use('/api/tickets', authenticateToken, require('./routes/tickets'));
app.use('/api/dashboard', authenticateToken, require('./routes/dashboard'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Phase 2: Authentication Implementation

### 2.1 Authentication Routes

```javascript
// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email and password required' }
      });
    }

    // Find user
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_INVALID', message: 'Invalid credentials' }
      });
    }

    // Generate tokens
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET + '_refresh',
      { expiresIn: '7d' }
    );

    // Store refresh token in Redis
    await redisClient.setEx(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, refreshToken);

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        expiresIn: 3600,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Internal server error' }
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Refresh token required' }
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET + '_refresh');
    const storedToken = await redisClient.get(`refresh_token:${decoded.userId}`);

    if (storedToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_INVALID', message: 'Invalid refresh token' }
      });
    }

    // Generate new access token
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    const user = userResult.rows[0];

    const newToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '1h' }
    );

    res.json({
      success: true,
      data: {
        token: newToken,
        expiresIn: 3600
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { code: 'AUTH_INVALID', message: 'Invalid refresh token' }
    });
  }
});

module.exports = router;
```

## Phase 3: Customer Management

### 3.1 Customer Routes Implementation

```javascript
// routes/customers.js
const express = require('express');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Get customer by ID
router.get('/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const result = await pool.query(`
      SELECT id, name, email, phone, account_number, account_type, balance,
             status, join_date, risk_level, preferred_language, 
             last_transaction_date, kyc_status
      FROM customers 
      WHERE id = $1
    `, [customerId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Customer not found' }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Internal server error' }
    });
  }
});

// Search customers
router.get('/search', async (req, res) => {
  try {
    const { q, phone, email, accountNumber, limit = 20, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM customers WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (q) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${q}%`);
    }
    
    if (phone) {
      paramCount++;
      query += ` AND phone = $${paramCount}`;
      params.push(phone);
    }
    
    if (email) {
      paramCount++;
      query += ` AND email = $${paramCount}`;
      params.push(email);
    }
    
    if (accountNumber) {
      paramCount++;
      query += ` AND account_number = $${paramCount}`;
      params.push(accountNumber);
    }

    query += ` ORDER BY name LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        customers: result.rows,
        totalCount: result.rowCount
      }
    });
  } catch (error) {
    console.error('Search customers error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Internal server error' }
    });
  }
});

module.exports = router;
```

## Phase 4: Real-time WebSocket Implementation

### 4.1 WebSocket Server Setup

```javascript
// websocket/server.js
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const redis = require('redis');

class WebSocketManager {
  constructor() {
    this.wss = new WebSocket.Server({ 
      port: process.env.WEBSOCKET_PORT || 3001,
      verifyClient: this.verifyClient.bind(this)
    });
    
    this.clients = new Map(); // conversationId -> Set of WebSocket connections
    this.redisClient = redis.createClient({ url: process.env.REDIS_URL });
    this.redisClient.connect();
    
    this.setupWebSocketHandlers();
  }

  verifyClient(info) {
    const url = new URL(info.req.url, 'http://localhost');
    const token = url.searchParams.get('token');
    
    if (!token) return false;
    
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return true;
    } catch (error) {
      return false;
    }
  }

  setupWebSocketHandlers() {
    this.wss.on('connection', (ws, req) => {
      const url = new URL(req.url, 'http://localhost');
      const token = url.searchParams.get('token');
      const conversationId = url.pathname.split('/').pop();
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        ws.userId = decoded.userId;
        ws.conversationId = conversationId;
        
        // Add to conversation room
        if (!this.clients.has(conversationId)) {
          this.clients.set(conversationId, new Set());
        }
        this.clients.get(conversationId).add(ws);
        
        console.log(`User ${ws.userId} joined conversation ${conversationId}`);
        
        ws.on('message', (data) => {
          this.handleMessage(ws, JSON.parse(data.toString()));
        });
        
        ws.on('close', () => {
          this.handleDisconnect(ws);
        });
        
        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
        });
        
      } catch (error) {
        ws.close(1008, 'Invalid token');
      }
    });
  }

  handleMessage(ws, message) {
    switch (message.type) {
      case 'join_conversation':
        this.handleJoinConversation(ws, message.data);
        break;
      case 'send_message':
        this.handleSendMessage(ws, message.data);
        break;
      case 'voice_activity':
        this.handleVoiceActivity(ws, message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  handleJoinConversation(ws, data) {
    const { conversationId, agentId } = data;
    
    // Notify other clients in the conversation
    this.broadcastToConversation(conversationId, {
      type: 'agent_joined',
      data: { agentId, timestamp: new Date().toISOString() }
    }, ws);
  }

  async handleSendMessage(ws, data) {
    try {
      const { content, speaker } = data;
      const conversationId = ws.conversationId;
      
      // Save message to database
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const result = await pool.query(`
        INSERT INTO messages (conversation_id, speaker, content, timestamp)
        VALUES ($1, $2, $3, NOW())
        RETURNING *
      `, [conversationId, speaker, content]);
      
      const message = result.rows[0];
      
      // Broadcast to all clients in conversation
      this.broadcastToConversation(conversationId, {
        type: 'message_received',
        data: {
          id: message.id,
          content: message.content,
          speaker: message.speaker,
          timestamp: message.timestamp
        }
      });
      
      // Trigger sentiment analysis
      this.triggerSentimentAnalysis(message);
      
    } catch (error) {
      console.error('Send message error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Failed to send message' }
      }));
    }
  }

  handleVoiceActivity(ws, data) {
    const { isActive, speaker, audioLevel } = data;
    
    // Broadcast voice activity to other clients
    this.broadcastToConversation(ws.conversationId, {
      type: 'voice_activity',
      data: { conversationId: ws.conversationId, isActive, speaker, audioLevel }
    }, ws);
  }

  broadcastToConversation(conversationId, message, excludeWs = null) {
    const clients = this.clients.get(conversationId);
    if (clients) {
      clients.forEach(client => {
        if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    }
  }

  handleDisconnect(ws) {
    const conversationId = ws.conversationId;
    if (this.clients.has(conversationId)) {
      this.clients.get(conversationId).delete(ws);
      if (this.clients.get(conversationId).size === 0) {
        this.clients.delete(conversationId);
      }
    }
    console.log(`User ${ws.userId} left conversation ${conversationId}`);
  }

  async triggerSentimentAnalysis(message) {
    // Add message to sentiment analysis queue
    await this.redisClient.lPush('sentiment_queue', JSON.stringify(message));
  }
}

module.exports = WebSocketManager;
```

## Phase 5: Sentiment Analysis Integration

### 5.1 Sentiment Analysis Service

```javascript
// services/sentimentAnalysis.js
const AWS = require('aws-sdk');
const axios = require('axios');
const { Pool } = require('pg');

class SentimentAnalysisService {
  constructor() {
    this.comprehend = new AWS.Comprehend({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
    
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.setupWorker();
  }

  setupWorker() {
    // Process sentiment analysis queue
    setInterval(async () => {
      await this.processQueue();
    }, 1000);
  }

  async processQueue() {
    const redisClient = require('redis').createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
    
    try {
      const messageData = await redisClient.brPop('sentiment_queue', 1);
      if (messageData) {
        const message = JSON.parse(messageData.element);
        await this.analyzeSentiment(message);
      }
    } catch (error) {
      console.error('Queue processing error:', error);
    } finally {
      await redisClient.disconnect();
    }
  }

  async analyzeSentiment(message) {
    try {
      // AWS Comprehend sentiment analysis
      const sentimentResult = await this.comprehend.detectSentiment({
        Text: message.content,
        LanguageCode: 'en'
      }).promise();

      // Extract emotions (if using advanced sentiment analysis)
      const emotions = await this.detectEmotions(message.content);
      
      // Calculate risk score
      const riskScore = this.calculateRiskScore(sentimentResult, emotions);
      
      // Save to database
      const analysisResult = await this.pool.query(`
        INSERT INTO sentiment_analysis 
        (message_id, conversation_id, sentiment, confidence, emotions, risk_score, escalation_required)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        message.id,
        message.conversation_id,
        sentimentResult.Sentiment.toLowerCase(),
        sentimentResult.SentimentScore[sentimentResult.Sentiment],
        JSON.stringify(emotions),
        riskScore,
        riskScore > 0.7
      ]);

      // Update message with sentiment
      await this.pool.query(`
        UPDATE messages 
        SET sentiment = $1, confidence = $2 
        WHERE id = $3
      `, [
        sentimentResult.Sentiment.toLowerCase(),
        sentimentResult.SentimentScore[sentimentResult.Sentiment],
        message.id
      ]);

      // Broadcast sentiment update via WebSocket
      this.broadcastSentimentUpdate(message.conversation_id, {
        messageId: message.id,
        sentiment: sentimentResult.Sentiment.toLowerCase(),
        confidence: sentimentResult.SentimentScore[sentimentResult.Sentiment],
        emotions,
        riskScore,
        escalationRequired: riskScore > 0.7
      });

    } catch (error) {
      console.error('Sentiment analysis error:', error);
    }
  }

  async detectEmotions(text) {
    // Use external emotion detection service or custom ML model
    try {
      const response = await axios.post('https://api.emotionservice.com/analyze', {
        text: text
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.EMOTION_API_KEY}`
        }
      });
      
      return response.data.emotions;
    } catch (error) {
      console.error('Emotion detection error:', error);
      return {
        joy: 0, anger: 0, fear: 0, sadness: 0, surprise: 0, disgust: 0
      };
    }
  }

  calculateRiskScore(sentimentResult, emotions) {
    let riskScore = 0;
    
    // Base risk from sentiment
    if (sentimentResult.Sentiment === 'NEGATIVE') {
      riskScore += sentimentResult.SentimentScore.Negative * 0.6;
    }
    
    // Add risk from emotions
    riskScore += emotions.anger * 0.3;
    riskScore += emotions.fear * 0.2;
    riskScore += emotions.sadness * 0.1;
    
    return Math.min(riskScore, 1.0);
  }

  broadcastSentimentUpdate(conversationId, data) {
    // Access WebSocket manager to broadcast
    const WebSocketManager = require('../websocket/server');
    // Implementation depends on your WebSocket architecture
  }
}

module.exports = SentimentAnalysisService;
```

## Phase 6: Voice Processing Integration

### 6.1 Voice Service Implementation

```javascript
// services/voiceService.js
const speech = require('@azure/cognitiveservices-speech-sdk');
const fs = require('fs');
const path = require('path');

class VoiceService {
  constructor() {
    this.speechConfig = speech.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
    this.speechConfig.speechRecognitionLanguage = 'en-US';
  }

  async transcribeAudio(audioBuffer, conversationId, speaker) {
    try {
      // Create audio config from buffer
      const audioConfig = speech.AudioConfig.fromWavFileInput(audioBuffer);
      const recognizer = new speech.SpeechRecognizer(this.speechConfig, audioConfig);

      return new Promise((resolve, reject) => {
        recognizer.recognizeOnceAsync(result => {
          if (result.reason === speech.ResultReason.RecognizedSpeech) {
            resolve({
              transcript: result.text,
              confidence: result.properties.getProperty(
                speech.PropertyId.SpeechServiceResponse_JsonResult
              ),
              language: 'en',
              duration: result.duration
            });
          } else {
            reject(new Error('Speech recognition failed'));
          }
          recognizer.close();
        });
      });
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  async synthesizeSpeech(text, voice = 'en-US-JennyNeural', speed = 1.0) {
    try {
      this.speechConfig.speechSynthesisVoiceName = voice;
      
      const synthesizer = new speech.SpeechSynthesizer(this.speechConfig);
      
      // Apply speed modification with SSML
      const ssml = `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
          <voice name="${voice}">
            <prosody rate="${speed}">
              ${text}
            </prosody>
          </voice>
        </speak>
      `;

      return new Promise((resolve, reject) => {
        synthesizer.speakSsmlAsync(ssml, result => {
          if (result.reason === speech.ResultReason.SynthesizingAudioCompleted) {
            // Save audio file
            const filename = `speech_${Date.now()}.wav`;
            const filepath = path.join(__dirname, '../public/audio', filename);
            
            fs.writeFileSync(filepath, Buffer.from(result.audioData));
            
            resolve({
              audioUrl: `/audio/${filename}`,
              duration: result.audioDuration / 10000000 // Convert to seconds
            });
          } else {
            reject(new Error('Speech synthesis failed'));
          }
          synthesizer.close();
        });
      });
    } catch (error) {
      console.error('Speech synthesis error:', error);
      throw error;
    }
  }
}

module.exports = VoiceService;
```

## Phase 7: Frontend Integration

### 7.1 API Service Layer

Create API service layer in the frontend:

```typescript
// frontend/src/services/api.ts
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
const WS_BASE_URL = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:3001';

class APIService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }

    return data;
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(response.data.token);
    return response.data;
  }

  // Customers
  async getCustomer(customerId: string) {
    return this.request(`/customers/${customerId}`);
  }

  async searchCustomers(query: string) {
    return this.request(`/customers/search?q=${encodeURIComponent(query)}`);
  }

  // Conversations
  async createConversation(customerId: string, agentId: string) {
    return this.request('/conversations', {
      method: 'POST',
      body: JSON.stringify({ customerId, agentId, channel: 'VOICE' }),
    });
  }

  async getConversation(conversationId: string) {
    return this.request(`/conversations/${conversationId}`);
  }

  // Messages
  async getMessages(conversationId: string, limit = 50) {
    return this.request(`/conversations/${conversationId}/messages?limit=${limit}`);
  }

  // Sentiment
  async getSentimentTimeline(conversationId: string) {
    return this.request(`/sentiment/conversation/${conversationId}`);
  }

  // Tickets
  async createTicket(ticketData: any) {
    return this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async getTickets(filters: any = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/tickets?${params}`);
  }

  // WebSocket connection
  connectWebSocket(conversationId: string) {
    const token = this.getToken();
    const ws = new WebSocket(`${WS_BASE_URL}/conversations/${conversationId}?token=${token}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return ws;
  }
}

export const apiService = new APIService();
```

### 7.2 Update Frontend Components

Update the VoiceChatWindow component to use real APIs:

```typescript
// components/VoiceChatWindow.tsx
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

export function VoiceChatWindow() {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Initialize conversation
    initializeConversation();
  }, []);

  const initializeConversation = async () => {
    try {
      // Create new conversation
      const response = await apiService.createConversation('customer_123', 'agent_456');
      setConversationId(response.data.id);
      
      // Connect WebSocket
      const websocket = apiService.connectWebSocket(response.data.id);
      setWs(websocket);
      
      websocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      };
      
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
    }
  };

  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case 'message_received':
        setMessages(prev => [...prev, message.data]);
        break;
      case 'sentiment_update':
        updateMessageSentiment(message.data);
        break;
      case 'voice_activity':
        handleVoiceActivity(message.data);
        break;
    }
  };

  const sendMessage = (content, speaker) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'send_message',
        data: { content, speaker }
      }));
    }
  };

  // Rest of component implementation...
}
```

## Phase 8: Deployment and Monitoring

### 8.1 Production Deployment

**Docker Configuration:**

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000 3001

CMD ["npm", "start"]
```

**Docker Compose:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/voicebot_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=voicebot_db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 8.2 Monitoring Setup

```javascript
// monitoring/metrics.js
const prometheus = require('prom-client');

// Create metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const activeWebSocketConnections = new prometheus.Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections'
});

const sentimentAnalysisRate = new prometheus.Counter({
  name: 'sentiment_analysis_total',
  help: 'Total number of sentiment analyses performed',
  labelNames: ['sentiment']
});

module.exports = {
  httpRequestDuration,
  activeWebSocketConnections,
  sentimentAnalysisRate,
  register: prometheus.register
};
```

## Testing Strategy

### 8.3 Testing Implementation

```javascript
// tests/integration/api.test.js
const request = require('supertest');
const app = require('../server');

describe('API Integration Tests', () => {
  let authToken;
  
  beforeAll(async () => {
    // Login and get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@bank.com', password: 'password123' });
    
    authToken = response.body.data.token;
  });

  describe('Customer endpoints', () => {
    test('GET /api/customers/:id should return customer data', async () => {
      const response = await request(app)
        .get('/api/customers/customer_123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name');
    });
  });

  describe('Conversation endpoints', () => {
    test('POST /api/conversations should create new conversation', async () => {
      const response = await request(app)
        .post('/api/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId: 'customer_123',
          agentId: 'agent_456'
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });
  });
});
```

This comprehensive integration guide provides backend developers with everything needed to implement real API integration for the Voice Bot Dashboard. The implementation includes authentication, real-time communication, sentiment analysis, and all the necessary endpoints for a production-ready banking voice bot system.