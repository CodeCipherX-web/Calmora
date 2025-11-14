/**
 * Calmora - Moods Routes
 * Handles mood logging and retrieval for users
 */

const express = require('express');
const { query } = require('../config/db');

const router = express.Router();

/**
 * POST /api/moods
 * Log a new mood entry for the authenticated user
 * Requires: mood_level (1-5), optional notes
 * Uses session to get user_id
 */
router.post('/', async (req, res) => {
  try {
    // Get user_id from session
    const user_id = req.session.userId;
    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.'
      });
    }

    const { mood_level, notes } = req.body;

    // Validate required fields
    if (!mood_level) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field. Please provide mood_level.'
      });
    }

    // Validate mood_level is between 1 and 5
    if (typeof mood_level !== 'number' || mood_level < 1 || mood_level > 5) {
      return res.status(400).json({
        success: false,
        error: 'Invalid mood_level. Must be a number between 1 and 5.'
      });
    }

    // Insert mood entry into database
    const result = await query(
      'INSERT INTO moods (user_id, mood_level, notes) VALUES (?, ?, ?)',
      [user_id, mood_level, notes || null]
    );

    // Fetch the created mood entry to return complete data
    const createdMoods = await query('SELECT * FROM moods WHERE id = ?', [result.insertId]);
    const createdMood = createdMoods[0];

    res.status(201).json({
      success: true,
      message: 'Mood logged successfully.',
      mood: createdMood
    });
  } catch (error) {
    console.error('Error logging mood:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Could not log mood.'
    });
  }
});

/**
 * GET /api/moods
 * Get all mood entries for the authenticated user
 * Returns moods ordered by creation date (newest first)
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

    // Fetch all moods for this user
    const moods = await query(
      'SELECT * FROM moods WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );

    res.json({
      success: true,
      count: moods.length,
      moods: moods
    });
  } catch (error) {
    console.error('Error fetching moods:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Could not fetch moods.'
    });
  }
});

module.exports = router;