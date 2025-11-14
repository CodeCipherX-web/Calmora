/**
 * Calmora - Resources Routes
 * Handles mental health resources retrieval
 */

const express = require('express');
const { query } = require('../config/db');

const router = express.Router();

/**
 * GET /api/resources
 * List all mental health resources in the database
 * Returns resources ordered by creation date (newest first)
 * Optional: ?category=category_name to filter by category
 */
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let resources;

    // If category is provided, filter by category
    if (category) {
      resources = await query(
        'SELECT * FROM resources WHERE category = ? ORDER BY created_at DESC',
        [category]
      );
    } else {
      // Fetch all resources from database
      resources = await query(
        'SELECT * FROM resources ORDER BY created_at DESC'
      );
    }

    res.json({
      success: true,
      count: resources.length,
      resources: resources
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Could not fetch resources.'
    });
  }
});

module.exports = router;