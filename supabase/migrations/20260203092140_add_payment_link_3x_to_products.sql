/*
  # Add payment link for 3x installments

  1. Changes
    - Add `payment_link_3x` column to products table
      - Stores custom payment link URLs for 3x installment payments
      - Optional field (nullable)
      - Text type to store full URLs
  
  2. Notes
    - This allows products to have custom payment links for 3x installment options
    - When set, the frontend will redirect to this URL instead of creating a Stripe checkout session
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'payment_link_3x'
  ) THEN
    ALTER TABLE products ADD COLUMN payment_link_3x text;
  END IF;
END $$;