# Supabase Setup Guide

## Environment Variables

Make sure your `.env.local` file contains:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Run the SQL script from `schema.sql` to create the tables:

   - `campaigns` table: Stores campaign information
   - `votes` table: Stores player votes with availability data

## Schema Overview

### campaigns table
- `id` (UUID): Primary key
- `title` (TEXT): Campaign name
- `dm_name` (TEXT): Dungeon Master name
- `timezone` (TEXT): DM's timezone (IANA format)
- `dates` (JSONB): Array of session dates/times
- `created_at` (TIMESTAMP): Creation timestamp

### votes table
- `id` (UUID): Primary key
- `campaign_id` (UUID): Foreign key to campaigns
- `player_name` (TEXT): Player's name
- `availability` (JSONB): Object mapping session IDs to vote values (yes/maybe/no)
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp
- Unique constraint on `(campaign_id, player_name)`

## Row Level Security (RLS)

For the MVP, you may want to disable RLS or set up policies to allow public read/write access. In production, you should set up proper RLS policies.

To disable RLS temporarily for testing:
```sql
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;
```

Or create policies for public access:
```sql
-- Allow anyone to read campaigns
CREATE POLICY "Allow public read access on campaigns"
  ON campaigns FOR SELECT
  USING (true);

-- Allow anyone to insert campaigns
CREATE POLICY "Allow public insert access on campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read votes
CREATE POLICY "Allow public read access on votes"
  ON votes FOR SELECT
  USING (true);

-- Allow anyone to insert/update votes
CREATE POLICY "Allow public insert/update access on votes"
  ON votes FOR ALL
  USING (true)
  WITH CHECK (true);
```

