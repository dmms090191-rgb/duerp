/*
  # Create Admin-Seller Messages Table

  1. New Tables
    - `admin_seller_messages`
      - `id` (uuid, primary key) - Unique identifier for each message
      - `seller_id` (text) - ID of the seller involved in the conversation
      - `sender_id` (text) - ID of the message sender (admin email or seller ID)
      - `sender_type` (text) - Type of sender: 'admin' or 'seller'
      - `sender_name` (text) - Name of the sender for display
      - `message` (text) - Content of the message
      - `read` (boolean) - Whether the message has been read
      - `created_at` (timestamptz) - Timestamp of message creation

  2. Security
    - Enable RLS on `admin_seller_messages` table
    - Add policies for public access (anon users can read, insert, update, delete)
    - This allows admin and sellers to communicate without authentication requirements

  3. Indexes
    - Add index on seller_id for faster lookups
    - Add index on created_at for chronological sorting
*/

CREATE TABLE IF NOT EXISTS admin_seller_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id text NOT NULL,
  sender_id text NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('admin', 'seller')),
  sender_name text,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_seller_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to admin_seller_messages"
  ON admin_seller_messages
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to admin_seller_messages"
  ON admin_seller_messages
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to admin_seller_messages"
  ON admin_seller_messages
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to admin_seller_messages"
  ON admin_seller_messages
  FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_admin_seller_messages_seller_id ON admin_seller_messages(seller_id);
CREATE INDEX IF NOT EXISTS idx_admin_seller_messages_created_at ON admin_seller_messages(created_at);
