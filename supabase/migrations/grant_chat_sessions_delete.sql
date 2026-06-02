-- Fix: grant DELETE privilege to authenticated users on chat_sessions
-- The RLS policy "Users can delete own chat sessions" already exists,
-- but without this table-level grant the operation is silently blocked.
GRANT DELETE ON TABLE chat_sessions TO authenticated;
