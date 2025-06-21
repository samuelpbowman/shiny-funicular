-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  task TEXT,
  completed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create index for user_id for better query performance
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos(user_id);

-- Create index for created_at for ordering
CREATE INDEX IF NOT EXISTS todos_created_at_idx ON todos(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own todos
CREATE POLICY "Users can view own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own todos
CREATE POLICY "Users can insert own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own todos
CREATE POLICY "Users can update own todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own todos
CREATE POLICY "Users can delete own todos" ON todos
  FOR DELETE USING (auth.uid() = user_id);