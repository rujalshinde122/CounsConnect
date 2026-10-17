-- ==============================================================================
-- CounsConnect: Patient Intake and Auto-Assignment to Archana Mulay
-- ==============================================================================

-- 1. Link clients to authenticated patient profiles
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'clients_user_id_key'
  ) THEN
    ALTER TABLE public.clients ADD CONSTRAINT clients_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 2. Add intake completion flag & client reference to patient_profiles
ALTER TABLE public.patient_profiles
ADD COLUMN IF NOT EXISTS is_intake_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;

-- 3. Row Level Security policies on clients table for patients
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Patients can view own client record'
  ) THEN
    CREATE POLICY "Patients can view own client record" ON public.clients FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Patients can insert own client record'
  ) THEN
    CREATE POLICY "Patients can insert own client record" ON public.clients FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Patients can update own client record'
  ) THEN
    CREATE POLICY "Patients can update own client record" ON public.clients FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- 4. Tasks & appointments RLS for patients via client ID
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS patient_notes text,
ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Patients can access tasks via client'
  ) THEN
    CREATE POLICY "Patients can access tasks via client" ON public.tasks FOR ALL TO authenticated USING (
      patient_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Patients can update own tasks'
  ) THEN
    CREATE POLICY "Patients can update own tasks" ON public.tasks 
    FOR UPDATE TO authenticated 
    USING (patient_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()))
    WITH CHECK (patient_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Patients can access appointments via client'
  ) THEN
    CREATE POLICY "Patients can access appointments via client" ON public.appointments FOR ALL TO authenticated USING (
      patient_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Patients can insert own appointments'
  ) THEN
    CREATE POLICY "Patients can insert own appointments" ON public.appointments 
    FOR INSERT TO authenticated 
    WITH CHECK (patient_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Patients can update own appointments'
  ) THEN
    CREATE POLICY "Patients can update own appointments" ON public.appointments 
    FOR UPDATE TO authenticated 
    USING (patient_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()))
    WITH CHECK (patient_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'session_notes' AND policyname = 'Patients can view own session notes'
  ) THEN
    CREATE POLICY "Patients can view own session notes" ON public.session_notes 
    FOR SELECT TO authenticated 
    USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));
  END IF;
END $$;

-- 5. Auto-assignment trigger for new patient registrations
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  user_role text;
  test_counselor_id uuid := '5bb94591-0d5f-4ada-8db0-1a46f13eabdd';
BEGIN
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'counselor');

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', CASE WHEN user_role = 'patient' THEN 'Patient' ELSE 'Counselor' END),
    user_role
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role;

  IF user_role = 'patient' THEN
    INSERT INTO public.patient_profiles (user_id, assigned_counselor_id, is_intake_completed)
    VALUES (new.id, test_counselor_id, false)
    ON CONFLICT (user_id) DO UPDATE
    SET assigned_counselor_id = COALESCE(patient_profiles.assigned_counselor_id, test_counselor_id);
  END IF;

  RETURN new;
END;
$$;
