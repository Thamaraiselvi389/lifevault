-- Public emergency profile access via token (no auth required)
CREATE OR REPLACE FUNCTION public.get_emergency_profile_by_token(token UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile RECORD;
  result JSONB := '{}';
  field TEXT;
BEGIN
  SELECT * INTO profile
  FROM public.emergency_profiles
  WHERE public_token = token;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  FOREACH field IN ARRAY profile.qr_visible_fields
  LOOP
    CASE field
      WHEN 'blood_group' THEN
        result := result || jsonb_build_object('blood_group', profile.blood_group);
      WHEN 'allergies' THEN
        result := result || jsonb_build_object('allergies', profile.allergies);
      WHEN 'medical_conditions' THEN
        result := result || jsonb_build_object('medical_conditions', profile.medical_conditions);
      WHEN 'medications' THEN
        result := result || jsonb_build_object('medications', profile.medications);
      WHEN 'emergency_contacts' THEN
        result := result || jsonb_build_object('emergency_contacts', profile.emergency_contacts);
      ELSE NULL;
    END CASE;
  END LOOP;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_emergency_profile_by_token(UUID) TO anon, authenticated;

-- Remove overly permissive policy if it exists
DROP POLICY IF EXISTS "Public can view emergency profile by token" ON public.emergency_profiles;
