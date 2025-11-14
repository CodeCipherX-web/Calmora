/**
 * Calmora - Seed Resources
 * Simple script to populate initial resources in the database
 * Run with: node scripts/seed-resources.js
 */

require('dotenv').config();
const { pool } = require('../config/db');

const initialResources = [
  {
    title: 'Understanding Mental Health',
    description: 'Learn about different mental health conditions, their symptoms, and treatment options.',
    link: 'https://www.nimh.nih.gov/health/topics',
    category: 'education'
  },
  {
    title: 'Coping Strategies for Stress',
    description: 'Discover effective techniques for managing stress, anxiety, and other mental health challenges.',
    link: 'https://www.apa.org/topics/stress',
    category: 'coping'
  },
  {
    title: 'Self-Care Guide',
    description: 'Practical tips and guides for maintaining your mental well-being through self-care practices.',
    link: 'https://www.mind.org.uk/information-support/tips-for-everyday-living/self-care/',
    category: 'self-care'
  },
  {
    title: 'Crisis Resources',
    description: 'Immediate help and support resources for mental health crises and emergencies.',
    link: 'https://988lifeline.org/',
    category: 'crisis'
  },
  {
    title: '10 Ways to Manage Anxiety',
    description: 'Practical techniques you can use daily to reduce anxiety and improve your mental well-being.',
    link: 'https://www.healthline.com/health/mental-health/how-to-cope-with-anxiety',
    category: 'anxiety'
  },
  {
    title: 'The Importance of Sleep for Mental Health',
    description: 'Learn how quality sleep impacts your mental health and discover tips for better sleep hygiene.',
    link: 'https://www.sleepfoundation.org/mental-health',
    category: 'wellness'
  },
  {
    title: 'Building Resilience',
    description: 'Strategies for developing emotional resilience and bouncing back from life\'s challenges.',
    link: 'https://www.apa.org/topics/resilience',
    category: 'coping'
  },
  {
    title: 'Mindfulness Meditation Guide',
    description: 'Learn the basics of mindfulness meditation and how it can improve your mental well-being.',
    link: 'https://www.mindful.org/how-to-meditate/',
    category: 'mindfulness'
  },
  {
    title: 'Understanding Depression',
    description: 'Comprehensive guide to understanding depression, its symptoms, and available treatment options.',
    link: 'https://www.nimh.nih.gov/health/topics/depression',
    category: 'education'
  }
];

async function seedResources() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    // Check if resources already exist
    const [existing] = await conn.query('SELECT COUNT(*) as count FROM resources');
    
    if (existing.count > 0) {
      console.log('Resources already exist. Skipping seed.');
      return;
    }
    
    // Insert resources
    for (const resource of initialResources) {
      await conn.query(
        'INSERT INTO resources (title, description, link, category) VALUES (?, ?, ?, ?)',
        [resource.title, resource.description, resource.link, resource.category]
      );
    }
    
    console.log(`Successfully seeded ${initialResources.length} resources`);
  } catch (error) {
    console.error('Error seeding resources:', error);
  } finally {
    if (conn) conn.release();
    process.exit();
  }
}

seedResources();

