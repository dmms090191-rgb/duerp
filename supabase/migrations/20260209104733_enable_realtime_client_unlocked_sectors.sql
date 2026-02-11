/*
  # Enable Realtime for client_unlocked_sectors table

  1. Changes
    - Enable Realtime publication for client_unlocked_sectors table
    - This allows real-time updates when sectors are unlocked/locked
*/

-- Enable realtime for client_unlocked_sectors table
ALTER PUBLICATION supabase_realtime ADD TABLE client_unlocked_sectors;