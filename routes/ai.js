/**
 * Calmora - AI Chatbot Route
 * OpenRouter AI integration for mental health support
 */

const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

// System prompt for mental health support
const SYSTEM_PROMPT = `You are a calm, empathetic mental-health support assistant named Calmora. 
- Speak softly, be understanding, and supportive
- Never give medical advice or diagnose conditions
- Always encourage reaching out to real people or crisis lines if the user sounds distressed
- Be warm, non-judgmental, and helpful
- Focus on active listening, validation, and providing helpful resources
- Keep responses concise but meaningful (2-4 sentences when possible)
- If someone mentions suicide, self-harm, or immediate crisis, strongly encourage contacting 988 (Suicide Prevention Lifeline) or 911 immediately`;

/**
 * POST /api/chat
 * Send user message to OpenRouter AI and get response
 */
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    // Validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    // Prepare request to OpenRouter
    // Using a reliable free model that works well for mental health support
    const openRouterResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: message.trim()
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5500',
          'X-Title': 'Calmora - Mental Health Support'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Extract AI reply
    const aiReply = openRouterResponse.data.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

    // Return response
    res.json({
      success: true,
      reply: aiReply
    });

  } catch (error) {
    console.error('OpenRouter AI error:', error.response?.data || error.message);
    
    // Handle different error types
    if (error.response) {
      // API returned an error
      const statusCode = error.response.status;
      const errorMessage = error.response.data?.error?.message || error.response.data?.error || 'AI service error';
      
      // Log full error details for debugging
      console.error('OpenRouter API error details:', {
        status: statusCode,
        error: error.response.data
      });
      
      return res.status(statusCode >= 400 && statusCode < 500 ? statusCode : 500).json({
        success: false,
        error: errorMessage
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('OpenRouter request timeout or no response');
      return res.status(503).json({
        success: false,
        error: 'AI service is temporarily unavailable. Please try again later.'
      });
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      console.error('OpenRouter request timeout');
      return res.status(504).json({
        success: false,
        error: 'Request timeout. The AI service took too long to respond. Please try again.'
      });
    } else {
      // Something else happened
      console.error('Unexpected error:', error.message);
      return res.status(500).json({
        success: false,
        error: 'An unexpected error occurred. Please try again.'
      });
    }
  }
});

module.exports = router;

