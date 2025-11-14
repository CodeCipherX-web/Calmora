/**
 * Calmora - Messages Routes
 * Handles chatbot message storage and retrieval
 */

const express = require('express');
const { query } = require('../config/db');

const router = express.Router();

/**
 * POST /api/messages
 * Store a chatbot message exchange
 * Requires: message, response
 * Uses session to get user_id (can be null for anonymous messages)
 */
router.post('/', async (req, res) => {
  try {
    // Get user_id from session (optional - can be null for anonymous)
    const user_id = req.session.userId || null;
    
    const { message, response } = req.body;

    // Validate required fields
    if (!message || !response) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields. Please provide message and response.'
      });
    }

    // Validate message and response are strings
    if (typeof message !== 'string' || typeof response !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message and response must be strings.'
      });
    }

    // Validate message and response are not empty
    if (message.trim().length === 0 || response.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message and response cannot be empty.'
      });
    }

    // Insert message into database
    // user_id can be NULL for anonymous messages
    const result = await query(
      'INSERT INTO messages (user_id, message, response) VALUES (?, ?, ?)',
      [user_id, message, response]
    );

    // Fetch the created message to return complete data
    const createdMessages = await query('SELECT * FROM messages WHERE id = ?', [result.insertId]);
    const createdMessage = createdMessages[0];

    res.status(201).json({
      success: true,
      message: 'Message stored successfully.',
      data: createdMessage
    });
  } catch (error) {
    console.error('Error storing message:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Could not store message.'
    });
  }
});

/**
 * GET /api/messages
 * Get all messages for the authenticated user
 * Returns messages ordered by creation date (newest first)
 * Uses session to get user_id
 */
router.get('/', async (req, res) => {
  try {
    // Get user_id from session
    const user_id = req.session.userId;
    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.'
      });
    }

    // Fetch all messages for this user
    const messages = await query(
      'SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );

    res.json({
      success: true,
      count: messages.length,
      messages: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Could not fetch messages.'
    });
  }
});

module.exports = router;