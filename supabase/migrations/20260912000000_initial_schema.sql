--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'Counselor'),
    COALESCE(new.raw_user_meta_data->>'role', 'counselor')
  );
  RETURN new;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    counselor_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    status text DEFAULT 'pending'::text,
    location text DEFAULT 'video'::text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT appointments_location_check CHECK ((location = ANY (ARRAY['video'::text, 'in-person'::text]))),
    CONSTRAINT appointments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'completed'::text, 'cancelled'::text])))
);


--
-- Name: check_ins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.check_ins (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid NOT NULL,
    mood text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    counselor_id uuid NOT NULL,
    name text NOT NULL,
    age integer,
    gender text,
    education text,
    marital_status text,
    profession text,
    issues text[] DEFAULT '{}'::text[],
    symptoms text[] DEFAULT '{}'::text[],
    wants_growth boolean DEFAULT false,
    swot_strengths text,
    swot_weaknesses text,
    swot_opportunities text,
    swot_threats text,
    notes text DEFAULT ''::text,
    status text DEFAULT 'Active'::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT clients_gender_check CHECK ((gender = ANY (ARRAY['Male'::text, 'Female'::text, 'Transgender'::text, 'Other'::text]))),
    CONSTRAINT clients_marital_status_check CHECK ((marital_status = ANY (ARRAY['Single'::text, 'Unmarried'::text, 'Single / Unmarried'::text, 'Married'::text, 'Divorced'::text, 'Widowed'::text]))),
    CONSTRAINT clients_status_check CHECK ((status = ANY (ARRAY['Active'::text, 'Inactive'::text, 'On Hold'::text])))
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sender_id uuid NOT NULL,
    receiver_id uuid NOT NULL,
    content text NOT NULL,
    type text DEFAULT 'text'::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT messages_type_check CHECK ((type = ANY (ARRAY['text'::text, 'video-call-link'::text, 'system'::text])))
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    body text,
    is_read boolean DEFAULT false,
    type text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: patient_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    assigned_counselor_id uuid,
    therapy_plan text,
    emergency_contact_name text,
    emergency_contact_phone text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    name text,
    role text NOT NULL,
    phone text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['counselor'::text, 'patient'::text])))
);


--
-- Name: resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    uploaded_by uuid NOT NULL,
    type text,
    title text,
    description text,
    url text,
    assigned_to uuid[] DEFAULT '{}'::uuid[],
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT resources_type_check CHECK ((type = ANY (ARRAY['video'::text, 'pdf'::text, 'article'::text, 'exercise'::text])))
);


--
-- Name: schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    counselor_id uuid NOT NULL,
    day_of_week text,
    start_time time without time zone,
    end_time time without time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    counselor_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    frequency text,
    deadline timestamp with time zone,
    status text DEFAULT 'pending'::text,
    feedback text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tasks_frequency_check CHECK ((frequency = ANY (ARRAY['daily'::text, 'weekly'::text, 'biweekly'::text, 'monthly'::text, 'once'::text]))),
    CONSTRAINT tasks_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'missed'::text, 'overdue'::text])))
);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: check_ins check_ins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.check_ins
    ADD CONSTRAINT check_ins_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: patient_profiles patient_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_profiles
    ADD CONSTRAINT patient_profiles_pkey PRIMARY KEY (id);


--
-- Name: patient_profiles patient_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_profiles
    ADD CONSTRAINT patient_profiles_user_id_key UNIQUE (user_id);


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: schedules schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_counselor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_counselor_id_fkey FOREIGN KEY (counselor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: check_ins check_ins_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.check_ins
    ADD CONSTRAINT check_ins_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: clients clients_counselor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_counselor_id_fkey FOREIGN KEY (counselor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: patient_profiles patient_profiles_assigned_counselor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_profiles
    ADD CONSTRAINT patient_profiles_assigned_counselor_id_fkey FOREIGN KEY (assigned_counselor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: patient_profiles patient_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_profiles
    ADD CONSTRAINT patient_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: resources resources_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: schedules schedules_counselor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_counselor_id_fkey FOREIGN KEY (counselor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_counselor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_counselor_id_fkey FOREIGN KEY (counselor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: appointments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

--
-- Name: appointments appointments_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY appointments_select_policy ON public.appointments FOR SELECT USING (((counselor_id = auth.uid()) OR (patient_id = auth.uid())));


--
-- Name: check_ins; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

--
-- Name: check_ins check_ins_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY check_ins_policy ON public.check_ins USING ((patient_id = auth.uid()));


--
-- Name: clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

--
-- Name: appointments counselors_manage_appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY counselors_manage_appointments ON public.appointments USING ((counselor_id = auth.uid()));


--
-- Name: clients counselors_manage_clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY counselors_manage_clients ON public.clients USING ((counselor_id = auth.uid()));


--
-- Name: resources counselors_manage_resources; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY counselors_manage_resources ON public.resources USING ((uploaded_by = auth.uid()));


--
-- Name: schedules counselors_manage_schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY counselors_manage_schedules ON public.schedules USING ((counselor_id = auth.uid()));


--
-- Name: tasks counselors_manage_tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY counselors_manage_tasks ON public.tasks USING ((counselor_id = auth.uid()));


--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: messages messages_access_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY messages_access_policy ON public.messages FOR SELECT USING (((sender_id = auth.uid()) OR (receiver_id = auth.uid())));


--
-- Name: messages messages_insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY messages_insert_policy ON public.messages FOR INSERT WITH CHECK ((sender_id = auth.uid()));


--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications notifications_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_policy ON public.notifications USING ((user_id = auth.uid()));


--
-- Name: patient_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: patient_profiles patient_profiles_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY patient_profiles_access ON public.patient_profiles FOR SELECT USING (((user_id = auth.uid()) OR (assigned_counselor_id = auth.uid())));


--
-- Name: patient_profiles patient_profiles_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY patient_profiles_update ON public.patient_profiles FOR UPDATE USING (((user_id = auth.uid()) OR (assigned_counselor_id = auth.uid())));


--
-- Name: tasks patients_update_tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY patients_update_tasks ON public.tasks FOR UPDATE USING ((patient_id = auth.uid()));


--
-- Name: tasks patients_view_tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY patients_view_tasks ON public.tasks FOR SELECT USING ((patient_id = auth.uid()));


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles_insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_insert_policy ON public.profiles FOR INSERT WITH CHECK ((id = auth.uid()));


--
-- Name: profiles profiles_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_select_policy ON public.profiles FOR SELECT USING (true);


--
-- Name: profiles profiles_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_update_policy ON public.profiles FOR UPDATE USING ((id = auth.uid()));


--
-- Name: resources; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

--
-- Name: resources resources_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY resources_select_policy ON public.resources FOR SELECT USING (((uploaded_by = auth.uid()) OR (auth.uid() = ANY (assigned_to))));


--
-- Name: schedules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

--
-- Name: schedules schedules_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY schedules_select_policy ON public.schedules FOR SELECT USING (true);


--
-- Name: tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


