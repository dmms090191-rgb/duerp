/*
  # Add Remarks Field to DUERP Evaluation Responses

  1. Changes
    - Add `remarks` column (text) to store user comments/remarks about the risk

  2. Security
    - No RLS changes needed (existing policies apply)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'duerp_evaluation_responses' AND column_name = 'remarks'
  ) THEN
    ALTER TABLE duerp_evaluation_responses ADD COLUMN remarks text DEFAULT '';
  END IF;
END $$;
