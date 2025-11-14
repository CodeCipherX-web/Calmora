-- Calmora Database Setup Script
-- MariaDB/MySQL compatible

-- Create database
CREATE DATABASE IF NOT EXISTS calmora CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE calmora;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: moods
CREATE TABLE IF NOT EXISTS moods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mood_level INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    CHECK (mood_level BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: messages (chatbot logs)
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: resources
CREATE TABLE IF NOT EXISTS resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    link VARCHAR(500) NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample resources
INSERT INTO resources (title, description, link, category) VALUES
('Understanding Mental Health', 'Learn about different mental health conditions, their symptoms, and treatment options.', 'https://www.nimh.nih.gov/health/topics', 'education'),
('Coping Strategies for Stress', 'Discover effective techniques for managing stress, anxiety, and other mental health challenges.', 'https://www.apa.org/topics/stress', 'coping'),
('Self-Care Guide', 'Practical tips and guides for maintaining your mental well-being through self-care practices.', 'https://www.mind.org.uk/information-support/tips-for-everyday-living/self-care/', 'self-care'),
('Crisis Resources', 'Immediate help and support resources for mental health crises and emergencies.', 'https://988lifeline.org/', 'crisis'),
('10 Ways to Manage Anxiety', 'Practical techniques you can use daily to reduce anxiety and improve your mental well-being.', 'https://www.healthline.com/health/mental-health/how-to-cope-with-anxiety', 'anxiety'),
('The Importance of Sleep for Mental Health', 'Learn how quality sleep impacts your mental health and discover tips for better sleep hygiene.', 'https://www.sleepfoundation.org/mental-health', 'wellness'),
('Building Resilience', 'Strategies for developing emotional resilience and bouncing back from life\'s challenges.', 'https://www.apa.org/topics/resilience', 'coping'),
('Mindfulness Meditation Guide', 'Learn the basics of mindfulness meditation and how it can improve your mental well-being.', 'https://www.mindful.org/how-to-meditate/', 'mindfulness'),
('Understanding Depression', 'Comprehensive guide to understanding depression, its symptoms, and available treatment options.', 'https://www.nimh.nih.gov/health/topics/depression', 'education');

-- Show summary
SELECT 'Database setup complete!' AS status;
SELECT COUNT(*) AS total_resources FROM resources;
SELECT 'Tables created: users, moods, messages, resources' AS tables;

