-- MVP Security & Compliance Agent - Security Events Table Migration
-- Creates a minimal but functional security event logging system

-- Create security event type enum
CREATE TYPE security_event_type AS ENUM (
  'login_success',
  'login_failure',
  'logout',
  'password_reset_request',
  'password_reset_success',
  'data_access',
  'data_modification',
  'rls_policy_violation',
  'suspicious_activity',
  'permission_denied',
  'audit_check'
);

-- Create security_events table
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type security_event_type NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_email VARCHAR(255),
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  entity_type VARCHAR(100),
  entity_id UUID,
  severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('low', 'medium', 'high', 'critical', 'info')),
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_security_events_timestamp ON security_events(timestamp DESC);
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_event_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_success ON security_events(success);

-- Enable RLS
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - only authenticated users can view their own events
-- Admins can view all events
CREATE POLICY "Users can view their own security events" ON security_events
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Users can insert security events (for logging purposes)
CREATE POLICY "Users can create security events" ON security_events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type security_event_type,
  p_details JSONB DEFAULT '{}',
  p_entity_type VARCHAR(100) DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_severity VARCHAR(20) DEFAULT 'info',
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
) 
RETURNS UUID AS $$
DECLARE
  event_id UUID;
  current_user_id UUID;
  current_user_email VARCHAR(255);
BEGIN
  -- Get current user info
  current_user_id := auth.uid();
  
  -- Get user email if user exists
  IF current_user_id IS NOT NULL THEN
    SELECT email INTO current_user_email 
    FROM auth.users 
    WHERE id = current_user_id;
  END IF;
  
  -- Insert security event
  INSERT INTO security_events (
    event_type,
    user_id,
    user_email,
    details,
    entity_type,
    entity_id,
    severity,
    success,
    error_message,
    metadata
  ) VALUES (
    p_event_type,
    current_user_id,
    current_user_email,
    p_details,
    p_entity_type,
    p_entity_id,
    p_severity,
    p_success,
    p_error_message,
    '{"source": "security_agent"}'::JSONB
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check RLS policy status
CREATE OR REPLACE FUNCTION check_rls_policies()
RETURNS TABLE (
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.relname::TEXT as table_name,
    c.relrowsecurity as rls_enabled,
    COUNT(p.polname)::INTEGER as policy_count
  FROM pg_class c
  LEFT JOIN pg_policies p ON p.tablename = c.relname
  WHERE c.relkind = 'r' 
    AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND c.relname IN ('organizations', 'contacts', 'products', 'opportunities', 'interactions', 'security_events')
  GROUP BY c.relname, c.relrowsecurity
  ORDER BY c.relname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for recent security activity (last 24 hours)
CREATE VIEW recent_security_activity AS
SELECT 
  id,
  event_type,
  user_email,
  details,
  entity_type,
  entity_id,
  severity,
  success,
  error_message,
  timestamp
FROM security_events
WHERE timestamp >= NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC
LIMIT 100;

-- Grant necessary permissions
GRANT SELECT ON recent_security_activity TO authenticated;
GRANT EXECUTE ON FUNCTION log_security_event TO authenticated;
GRANT EXECUTE ON FUNCTION check_rls_policies TO authenticated;

-- Log the creation of this security system
SELECT log_security_event(
  'audit_check'::security_event_type,
  '{"action": "security_system_initialized", "version": "1.0"}'::JSONB,
  'system',
  NULL,
  'info',
  true,
  NULL
);