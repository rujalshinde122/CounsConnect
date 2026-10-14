-- ==============================================================================
-- Migration: Add transcript and language tracking to session_notes
-- Allows storing full real-time speech-to-text transcripts for counseling sessions
-- ==============================================================================

ALTER TABLE public.session_notes 
ADD COLUMN IF NOT EXISTS transcript TEXT,
ADD COLUMN IF NOT EXISTS transcript_language VARCHAR(10) DEFAULT 'en-IN';

COMMENT ON COLUMN public.session_notes.transcript IS 'Full recorded/transcribed speech text from the active counseling session';
COMMENT ON COLUMN public.session_notes.transcript_language IS 'Language used for speech recognition (e.g., mr-IN, hi-IN, en-IN)';
