-- Migration to add source field to transactions table
-- Run this if you already have existing data

-- Add source column to transactions table
ALTER TABLE transactions ADD COLUMN source TEXT DEFAULT 'Unknown';

-- Optional: Update existing transactions to have a default source
UPDATE transactions SET source = 'Manual Entry' WHERE source = 'Unknown' OR source IS NULL;
