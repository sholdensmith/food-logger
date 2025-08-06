-- Updated Food Logger Database Schema for Supabase (String User IDs)

-- Drop existing table if it exists
DROP TABLE IF EXISTS food_entries CASCADE;

-- Create food_entries table with TEXT user_id
CREATE TABLE food_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    calories INTEGER NOT NULL,
    protein DECIMAL(5,2) NOT NULL,
    carbs DECIMAL(5,2) NOT NULL,
    fats DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_food_entries_user_date ON food_entries(user_id, date);
CREATE INDEX idx_food_entries_created_at ON food_entries(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for anonymous users)
-- In production, you might want to restrict this based on authentication
CREATE POLICY "Allow all operations for food_entries" ON food_entries
    FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_food_entries_updated_at 
    BEFORE UPDATE ON food_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a function to clean up old entries (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_entries()
RETURNS void AS $$
BEGIN
    DELETE FROM food_entries 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-old-entries', '0 2 * * *', 'SELECT cleanup_old_entries();'); 