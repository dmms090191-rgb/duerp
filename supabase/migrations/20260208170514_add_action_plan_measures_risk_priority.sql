/*
  # Add Action Plan Measures and Risk Priority to DUERP Evaluation Responses

  1. Changes
    - Add `action_plan_measures` column (jsonb) to store measures to be added to action plan
    - Add `risk_priority` column (text) to store risk priority level (faible, moyenne, elevee)

  2. Security
    - No RLS changes needed (existing policies apply)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'duerp_evaluation_responses' AND column_name = 'action_plan_measures'
  ) THEN
    ALTER TABLE duerp_evaluation_responses ADD COLUMN action_plan_measures jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'duerp_evaluation_responses' AND column_name = 'risk_priority'
  ) THEN
    ALTER TABLE duerp_evaluation_responses ADD COLUMN risk_priority text CHECK (risk_priority IN ('faible', 'moyenne', 'elevee'));
  END IF;
END $$;
