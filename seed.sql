-- LifeVault Sample Data
-- Replace USER_ID with your authenticated user's UUID after signing up
-- Run in Supabase SQL Editor

-- Example: set your user id
-- DO NOT run in production with hardcoded IDs — use after first login

/*
INSERT INTO public.documents (user_id, title, description, category, file_name, file_size, mime_type) VALUES
  ('YOUR_USER_ID', 'Passport Scan', 'International passport copy', 'identity', 'passport.pdf', 245000, 'application/pdf'),
  ('YOUR_USER_ID', 'Health Insurance Card', 'Primary health insurance', 'insurance', 'insurance.pdf', 120000, 'application/pdf'),
  ('YOUR_USER_ID', 'Degree Certificate', 'Bachelor of Science diploma', 'education', 'degree.pdf', 890000, 'application/pdf'),
  ('YOUR_USER_ID', 'Tax Return 2025', 'Annual tax filing documents', 'finance', 'tax2025.pdf', 340000, 'application/pdf');

INSERT INTO public.tasks (user_id, title, description, priority, due_date, is_completed) VALUES
  ('YOUR_USER_ID', 'Renew passport', 'Expires in 6 months', 'high', CURRENT_DATE + 30, false),
  ('YOUR_USER_ID', 'Schedule annual checkup', 'Book doctor appointment', 'medium', CURRENT_DATE + 14, false),
  ('YOUR_USER_ID', 'Review investment portfolio', 'Quarterly finance review', 'medium', CURRENT_DATE + 7, false),
  ('YOUR_USER_ID', 'Complete online course', 'Finish React advanced module', 'low', CURRENT_DATE - 5, true);

INSERT INTO public.diary_entries (user_id, title, content, mood, entry_date) VALUES
  ('YOUR_USER_ID', 'Productive Monday', 'Started organizing all my documents in LifeVault. Feeling accomplished!', 'great', CURRENT_DATE - 2),
  ('YOUR_USER_ID', 'Reflection', 'Set new goals for the quarter. Excited about the fitness target.', 'good', CURRENT_DATE - 1),
  ('YOUR_USER_ID', 'Today', 'Working on my portfolio project. LifeVault is coming together nicely.', 'good', CURRENT_DATE);

INSERT INTO public.goals (user_id, title, description, category, target_date, progress) VALUES
  ('YOUR_USER_ID', 'Run a half marathon', 'Train 4x per week, build up to 21km', 'fitness', CURRENT_DATE + 120, 35),
  ('YOUR_USER_ID', 'Save $10,000 emergency fund', 'Monthly savings of $500', 'finance', CURRENT_DATE + 365, 60),
  ('YOUR_USER_ID', 'Learn TypeScript deeply', 'Complete advanced TS course and build 2 projects', 'education', CURRENT_DATE + 90, 45),
  ('YOUR_USER_ID', 'Get promoted to Senior', 'Lead 2 major projects and mentor juniors', 'career', CURRENT_DATE + 180, 25);

INSERT INTO public.future_messages (user_id, title, content, unlock_date) VALUES
  ('YOUR_USER_ID', 'Letter to 2027 me', 'Dear future me, I hope you achieved your goals and stayed healthy. Remember why you started.', CURRENT_DATE + 365),
  ('YOUR_USER_ID', 'Birthday surprise', 'Happy birthday! You made it another year. Celebrate yourself today.', CURRENT_DATE + 180);

INSERT INTO public.emergency_profiles (user_id, blood_group, allergies, medical_conditions, medications, emergency_contacts, qr_visible_fields) VALUES
  ('YOUR_USER_ID', 'O+', ARRAY['Penicillin', 'Peanuts'], ARRAY['Asthma'], ARRAY['Albuterol inhaler'], 
   '[{"name":"Jane Doe","relationship":"Spouse","phone":"+1-555-0100"},{"name":"John Smith","relationship":"Brother","phone":"+1-555-0101"}]'::jsonb,
   ARRAY['blood_group','allergies','emergency_contacts']);

INSERT INTO public.reminders (user_id, title, reminder_date) VALUES
  ('YOUR_USER_ID', 'Passport renewal deadline', CURRENT_DATE + 30 + TIME '09:00'),
  ('YOUR_USER_ID', 'Doctor appointment', CURRENT_DATE + 14 + TIME '14:00');
*/

-- Helper: seed data for the currently logged-in user via function (run once)
CREATE OR REPLACE FUNCTION public.seed_demo_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM public.documents WHERE user_id = uid LIMIT 1) THEN
    RAISE EXCEPTION 'Demo data already exists';
  END IF;

  INSERT INTO public.documents (user_id, title, description, category, file_name, file_size, mime_type) VALUES
    (uid, 'Passport Scan', 'International passport copy', 'identity', 'passport.pdf', 245000, 'application/pdf'),
    (uid, 'Health Insurance Card', 'Primary health insurance', 'insurance', 'insurance.pdf', 120000, 'application/pdf'),
    (uid, 'Degree Certificate', 'Bachelor of Science diploma', 'education', 'degree.pdf', 890000, 'application/pdf');

  INSERT INTO public.tasks (user_id, title, description, priority, due_date, is_completed, completed_at) VALUES
    (uid, 'Renew passport', 'Expires in 6 months', 'high', CURRENT_DATE + 30, false, NULL),
    (uid, 'Schedule annual checkup', 'Book doctor appointment', 'medium', CURRENT_DATE + 14, false, NULL),
    (uid, 'Complete online course', 'Finish React advanced module', 'low', CURRENT_DATE - 5, true, NOW() - INTERVAL '5 days');

  INSERT INTO public.diary_entries (user_id, title, content, mood, entry_date) VALUES
    (uid, 'Productive Monday', 'Started organizing all my documents in LifeVault. Feeling accomplished!', 'great', CURRENT_DATE - 2),
    (uid, 'Today', 'Working on my portfolio project. LifeVault is coming together nicely.', 'good', CURRENT_DATE);

  INSERT INTO public.goals (user_id, title, description, category, target_date, progress) VALUES
    (uid, 'Run a half marathon', 'Train 4x per week', 'fitness', CURRENT_DATE + 120, 35),
    (uid, 'Save emergency fund', 'Monthly savings goal', 'finance', CURRENT_DATE + 365, 60);

  INSERT INTO public.future_messages (user_id, title, content, unlock_date) VALUES
    (uid, 'Letter to future me', 'Dear future me, I hope you achieved your goals and stayed healthy.', CURRENT_DATE + 365);

  INSERT INTO public.reminders (user_id, title, reminder_date) VALUES
    (uid, 'Passport renewal deadline', (CURRENT_DATE + 30)::timestamptz + TIME '09:00');
END;
$$;

GRANT EXECUTE ON FUNCTION public.seed_demo_data() TO authenticated;
