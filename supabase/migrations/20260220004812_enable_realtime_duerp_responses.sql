/*
  # Enable Realtime for DUERP Evaluation Responses

  1. Changes
    - Enable realtime on `duerp_evaluation_responses` table to allow real-time updates in the Avancement view
    - This allows the progress bars to update automatically when questions are answered in the diagnostic form

  2. Security
    - No changes to RLS policies, existing policies remain in effect
*/

-- Enable realtime for duerp_evaluation_responses table
ALTER PUBLICATION supabase_realtime ADD TABLE duerp_evaluation_responses;
