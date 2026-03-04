/*
  # Add sender_name to chat_messages

  1. Changes
    - Add `sender_name` column to `chat_messages` table to store the name of the message sender
    - This allows displaying the correct sender name in the chat interface
  
  2. Notes
    - Existing messages will have NULL sender_name (can be backfilled if needed)
    - New messages will include the sender's name
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'sender_name'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN sender_name text;
  END IF;
END $$;