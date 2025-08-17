-- Add table for email backup settings
CREATE TABLE IF NOT EXISTS email_backup_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    next_backup TIMESTAMP WITH TIME ZONE,
    last_backup TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE email_backup_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own email backup settings" ON email_backup_settings
    FOR ALL USING (auth.uid() = user_id);
