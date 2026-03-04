/*
  # Add Stripe integration fields to products table

  1. Changes to `products` table
    - Add `stripe_product_id` (text) - Stripe product ID
    - Add `stripe_price_id` (text) - Stripe price ID
    - Add `employee_range` (text) - Employee range (e.g., "1-5", "6-10")
    - Add `unit_amount` (integer) - Price in cents
    - Add `currency` (text) - Currency code (default EUR)
    - Add `is_active` (boolean) - Whether the product is active

  2. Security
    - No RLS changes needed (inherits existing policies)
*/

DO $$
BEGIN
  -- Add stripe_product_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stripe_product_id'
  ) THEN
    ALTER TABLE products ADD COLUMN stripe_product_id text;
  END IF;

  -- Add stripe_price_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stripe_price_id'
  ) THEN
    ALTER TABLE products ADD COLUMN stripe_price_id text UNIQUE;
  END IF;

  -- Add employee_range if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'employee_range'
  ) THEN
    ALTER TABLE products ADD COLUMN employee_range text;
  END IF;

  -- Add unit_amount if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'unit_amount'
  ) THEN
    ALTER TABLE products ADD COLUMN unit_amount integer;
  END IF;

  -- Add currency if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'currency'
  ) THEN
    ALTER TABLE products ADD COLUMN currency text DEFAULT 'eur';
  END IF;

  -- Add is_active if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE products ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;
