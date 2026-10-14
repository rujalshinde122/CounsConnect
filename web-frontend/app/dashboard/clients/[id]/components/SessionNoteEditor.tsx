'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Check, 
  Loader2, 
  Mic, 
  MicOff, 
  Sparkles, 
  Trash2, 
  Copy, 
  Languages, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Volume2,
  Radio,
  FileAudio
} from 'lucide-react'

interface Props {
  clientId: string
  counselorId: string
  clientName?: string
  clientIssues?: string[]
  onSaved?: () => void
}

type SupportedLanguage = 'en-IN' | 'hi-IN' | 'mr-IN'

const LANGUAGE_LABELS: Record<SupportedLanguage, { name: string; native: string }> = {
  'mr-IN': { name: 'Marathi', native: 'मराठी' },
  'hi-IN': { name: 'Hindi', native: 'हिंदी' },
  'en-IN': { name: 'English', native: 'India' },
}

export default function SessionNoteEditor({ clientId, counselorId, clientName, clientIssues, onSaved }: Props) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Standard Form State
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10))
  const [duration, setDuration] = useState('60')
  const [modality, setModality] = useState('In-Person')
  const [tagsInput, setTagsInput] = useState('')
  const [progressRating, setProgressRating] = useState<string>('3')

  const [subjective, setSubjective] = useState('')
  const [objective, setObjective] = useState('')
  const [assessment, setAssessment] = useState('')
  const [plan, setPlan] = useState('')
  const [homework, setHomework] = useState('')
  const [homeworkFrequency, setHomeworkFrequency] = useState('once')
  const [privateNotes, setPrivateNotes] = useState('')

  // Speech Recognition & Audio State
  const [isListening, setIsListening] = useState(false)
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('en-IN')
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isPanelExpanded, setIsPanelExpanded] = useState(true)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [audioLevel, setAudioLevel] = useState<number>(0)
  const [micStatusMessage, setMicStatusMessage] = useState<string | null>(null)
  const [speechWarning, setSpeechWarning] = useState<string | null>(null)
  
  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isTranscribingAudio, setIsTranscribingAudio] = useState(false)
  const [copied, setCopied] = useState(false)
  const [riskAlert, setRiskAlert] = useState<{ level: string; notes: string } | null>(null)
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([])
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null)
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false)

  // References
  const recognitionRef = useRef<any>(null)
  const isListeningRef = useRef<boolean>(false)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const animFrameRef = useRef<number | null>(null)

  // Live Timer for Speech Recording
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isListening) {
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isListening])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop())
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try { audioContextRef.current.close() } catch {}
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [])

  // Speech Recognition Instantiation helper
  const createAndStartRecognition = useCallback((lang: SupportedLanguage) => {
    if (typeof window === 'undefined') return
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setSpeechWarning('Browser Web Speech API is not supported in this browser. Please use Chrome/Edge or use Audio Recording mode.')
      return
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch {}
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = lang

      recognition.onstart = () => {
        setSpeechWarning(null)
      }

      recognition.onresult = (event: any) => {
        let interim = ''
        let finalChunk = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const text = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalChunk += text + ' '
          } else {
            interim += text
          }
        }

        if (finalChunk) {
          setTranscript(prev => (prev ? prev.trim() + ' ' + finalChunk.trim() : finalChunk.trim()))
        }
        setInterimTranscript(interim)
      }

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error)
        if (event.error === 'not-allowed') {
          setSpeechWarning('Microphone access blocked. Click the lock/settings icon in your browser URL bar to allow microphone.')
          isListeningRef.current = false
          setIsListening(false)
        } else if (event.error === 'network') {
          setSpeechWarning('Google speech service network issue. Don’t worry — your voice is being recorded! Use "Transcribe Audio with Gemini" below for guaranteed conversion.')
        } else if (event.error === 'no-speech') {
          // Normal silence, ignore
        } else if (event.error === 'audio-capture') {
          setSpeechWarning('No microphone sound detected. Please verify your Windows microphone settings.')
        }
      }

      recognition.onend = () => {
        // Auto-reconnect cleanly if still in recording state
        if (isListeningRef.current) {
          try {
            // Re-instantiate to avoid Chromium InvalidStateError on stopped recognition
            createAndStartRecognition(lang)
          } catch {
            // Ignore
          }
        }
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.warn('Could not launch SpeechRecognition:', err)
    }
  }, [])

  // Start Full Listening & Audio Recording Stream
  const startListening = async () => {
    try {
      setSpeechWarning(null)
      setMicStatusMessage('Requesting microphone...')

      // 1. Explicitly open microphone stream to confirm permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true 
        } 
      })
      mediaStreamRef.current = stream

      // 2. Setup Web Audio API decibel / volume analyzer
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        const audioCtx = new AudioCtx()
        audioContextRef.current = audioCtx
        const source = audioCtx.createMediaStreamSource(stream)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)

        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        const checkVolume = () => {
          if (!isListeningRef.current) {
            setAudioLevel(0)
            return
          }
          analyser.getByteFrequencyData(dataArray)
          let sum = 0
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i]
          }
          const avg = sum / dataArray.length
          const normalized = Math.min(100, Math.round((avg / 128) * 100))
          setAudioLevel(normalized)
          animFrameRef.current = requestAnimationFrame(checkVolume)
        }
        animFrameRef.current = requestAnimationFrame(checkVolume)
      } catch (audioErr) {
        console.warn('AudioContext analyzer not available:', audioErr)
      }

      // 3. Setup MediaRecorder for fail-proof backup audio capture
      try {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4'

        const mediaRecorder = new MediaRecorder(stream, { mimeType })
        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data)
            setHasRecordedAudio(true)
          }
        }

        mediaRecorder.start(2000) // Collect chunks every 2 seconds
      } catch (recErr) {
        console.warn('MediaRecorder init error:', recErr)
      }

      // 4. Start Web Speech API recognition for live text display
      isListeningRef.current = true
      setIsListening(true)
      setMicStatusMessage(null)
      createAndStartRecognition(selectedLang)

    } catch (err: any) {
      console.error('Failed to access microphone:', err)
      isListeningRef.current = false
      setIsListening(false)
      setMicStatusMessage(null)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        alert('Microphone permission denied. Please allow microphone access in your browser address bar.')
      } else {
        alert('Could not start microphone: ' + (err.message || 'Check microphone connection.'))
      }
    }
  }

  // Pause / Stop Listening
  const pauseListening = () => {
    isListeningRef.current = false
    setIsListening(false)
    setAudioLevel(0)

    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop() } catch {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop())
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
    }
  }

  // Language Change Handler
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setSelectedLang(newLang)
    if (isListening) {
      pauseListening()
      setTimeout(() => {
        setSelectedLang(newLang)
        startListening()
      }, 200)
    }
  }

  const handleClearTranscript = () => {
    if (confirm('Clear the current transcript and audio?')) {
      setTranscript('')
      setInterimTranscript('')
      setRecordingSeconds(0)
      audioChunksRef.current = []
      setHasRecordedAudio(false)
    }
  }

  const handleCopyTranscript = () => {
    const full = (transcript + ' ' + interimTranscript).trim()
    if (!full) return
    navigator.clipboard.writeText(full)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Convert Recorded Blob to Base64
  const getAudioBase64 = async (): Promise<{ base64: string; mimeType: string } | null> => {
    if (audioChunksRef.current.length === 0) return null
    const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm'
    const blob = new Blob(audioChunksRef.current, { type: mimeType })
    
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const resultStr = reader.result as string
        const base64Data = resultStr.split(',')[1]
        resolve({ base64: base64Data, mimeType })
      }
      reader.readAsDataURL(blob)
    })
  }

  // Option A: Direct Gemini Audio Transcription & SOAP Synthesis
  const handleTranscribeFromAudio = async () => {
    // If still recording, pause first to finalize audio buffer
    if (isListening) {
      pauseListening()
      await new Promise(r => setTimeout(r, 250))
    }

    setIsTranscribingAudio(true)
    setRiskAlert(null)
    setAiSuccessMessage(null)

    try {
      const audioData = await getAudioBase64()
      if (!audioData) {
        alert('No audio recorded yet. Please click "Start Listening" and speak into your microphone first.')
        setIsTranscribingAudio(false)
        return
      }

      const res = await fetch('/api/clinical/transcribe-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: audioData.base64,
          mimeType: audioData.mimeType,
          language: selectedLang,
          clientName,
          clientIssues,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to transcribe audio')
      }

      const { data } = json

      // Populate full verbatim transcript
      if (data.transcript) {
        setTranscript(data.transcript)
        setInterimTranscript('')
      }

      // Populate SOAP notes
      if (data.subjective) setSubjective(data.subjective)
      if (data.objective) setObjective(data.objective)
      if (data.assessment) setAssessment(data.assessment)
      if (data.plan) setPlan(data.plan)

      // Merge tags
      if (Array.isArray(data.tags) && data.tags.length > 0) {
        const existingTags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : []
        const combined = Array.from(new Set([...existingTags, ...data.tags]))
        setTagsInput(combined.join(', '))
        setExtractedKeywords(data.tags)
      }

      // Risk Scan
      if (data.risk_assessment && data.risk_assessment.level !== 'Low') {
        setRiskAlert(data.risk_assessment)
      }

      setAiSuccessMessage('Audio transcribed verbatim & clinical SOAP note generated with Gemini!')
      setTimeout(() => setAiSuccessMessage(null), 6000)
    } catch (err: any) {
      console.error('Audio transcription failed:', err)
      alert(err.message || 'Error communicating with AI service. Please verify your GEMINI_API_KEY in .env.local.')
    } finally {
      setIsTranscribingAudio(false)
    }
  }

  // Option B: Generate from Existing Transcript Text
  const handleAnalyzeTextSession = async () => {
    const combinedTranscript = (transcript + ' ' + interimTranscript).trim()
    if (!combinedTranscript || combinedTranscript.length < 20) {
      alert('The transcript is too short to analyze. Please speak or paste dialogue first, or use "Transcribe Audio with Gemini".')
      return
    }

    setIsAnalyzing(true)
    setRiskAlert(null)
    setAiSuccessMessage(null)

    try {
      const res = await fetch('/api/clinical/analyze-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: combinedTranscript,
          language: selectedLang,
          clientName,
          clientIssues,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to analyze transcript')
      }

      const { data } = json

      if (data.subjective) setSubjective(data.subjective)
      if (data.objective) setObjective(data.objective)
      if (data.assessment) setAssessment(data.assessment)
      if (data.plan) setPlan(data.plan)

      if (Array.isArray(data.tags) && data.tags.length > 0) {
        const existingTags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : []
        const combined = Array.from(new Set([...existingTags, ...data.tags]))
        setTagsInput(combined.join(', '))
        setExtractedKeywords(data.tags)
      }

      if (data.risk_assessment && data.risk_assessment.level !== 'Low') {
        setRiskAlert(data.risk_assessment)
      }

      setAiSuccessMessage('Clinical SOAP notes & keyword analysis generated successfully!')
      setTimeout(() => setAiSuccessMessage(null), 6000)
    } catch (err: any) {
      console.error('Session analysis failed:', err)
      alert(err.message || 'Error communicating with AI service. Please check your GEMINI_API_KEY in .env.local.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Save Session Note & Transcript to Supabase
  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    
    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    
    const { count } = await supabase
      .from('session_notes')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
    const nextSessionNumber = (count || 0) + 1

    const finalTranscript = (transcript + ' ' + interimTranscript).trim()

    const insertPayload: any = {
      client_id: clientId,
      counselor_id: counselorId,
      session_number: nextSessionNumber,
      session_date: new Date(date).toISOString(),
      duration_minutes: parseInt(duration) || 60,
      modality,
      subjective,
      objective,
      assessment,
      plan,
      homework_assigned: homework,
      private_clinical_notes: privateNotes,
      tags: tagsArray,
      progress_rating: parseInt(progressRating) || null,
    }

    if (finalTranscript) {
      insertPayload.transcript = finalTranscript
      insertPayload.transcript_language = selectedLang
    }

    let { data: sessionData, error } = await supabase
      .from('session_notes')
      .insert(insertPayload)
      .select('id')
      .single()

    // Graceful Fallback if DB column doesn't exist yet
    if (error && error.message && error.message.toLowerCase().includes('transcript')) {
      const fallbackPrivateNotes = privateNotes
        ? `${privateNotes}\n\n--- [SESSION TRANSCRIPT (${selectedLang})] ---\n${finalTranscript}`
        : `--- [SESSION TRANSCRIPT (${selectedLang})] ---\n${finalTranscript}`

      delete insertPayload.transcript
      delete insertPayload.transcript_language
      insertPayload.private_clinical_notes = fallbackPrivateNotes

      const retryRes = await supabase.from('session_notes').insert(insertPayload).select('id').single()
      sessionData = retryRes.data
      error = retryRes.error
    }
    
    // Auto-create task if homework was manually entered
    if (!error && sessionData?.id && homework.trim() !== '') {
      await supabase.from('tasks').insert({
        counselor_id: counselorId,
        patient_id: clientId,
        session_id: sessionData.id,
        title: 'Session Homework',
        description: homework.trim(),
        frequency: homeworkFrequency,
        status: 'pending'
      })
    }

    setSaving(false)
    if (!error) {
      setSaved(true)
      setSubjective(''); setObjective(''); setAssessment(''); setPlan(''); setHomework(''); setHomeworkFrequency('once'); setPrivateNotes(''); setTagsInput(''); setProgressRating('3')
      setTranscript(''); setInterimTranscript(''); setRecordingSeconds(0); setRiskAlert(null); setExtractedKeywords([])
      audioChunksRef.current = []
      setHasRecordedAudio(false)
      setTimeout(() => setSaved(false), 3000)
      if (onSaved) onSaved()
    } else {
      console.error('Error saving session note:', error)
      alert('Failed to save note: ' + error.message)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E0D6] shadow-2xs overflow-hidden">
      {/* Header bar */}
      <div className="px-6 py-4 border-b border-[#E2E0D6] bg-[#F6F5EE]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[#2D3A3A]">New Session Note</h3>
          <p className="text-xs text-[#5A6B6B]">SOAP format structured clinical documentation</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1 rounded-md border border-[#E2E0D6] shadow-xs">
           <input 
             type="date" 
             value={date} 
             onChange={e => setDate(e.target.value)} 
             className="text-xs px-2 py-1 outline-none text-[#2D3A3A] font-medium"
           />
           <div className="w-px h-4 bg-[#E2E0D6]"></div>
           <Select value={modality} onValueChange={(val) => setModality(val || 'In-Person')}>
              <SelectTrigger className="w-[110px] h-7 text-xs border-none shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In-Person">In-Person</SelectItem>
                <SelectItem value="Virtual">Virtual</SelectItem>
              </SelectContent>
           </Select>
           <div className="w-px h-4 bg-[#E2E0D6]"></div>
           <div className="flex items-center px-2">
             <input 
               type="number" 
               value={duration} 
               onChange={e => setDuration(e.target.value)} 
               className="w-10 text-xs text-right outline-none font-medium" 
             />
             <span className="text-xs text-[#5A6B6B] ml-1">min</span>
           </div>
        </div>
      </div>

      {/* Real-time Speech-to-Text & AI Assistant Widget */}
      <div className="border-b border-[#E2E0D6] bg-gradient-to-r from-[#F6F5EE]/60 via-white to-[#EDF4F2]/50 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isListening 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-200 animate-pulse' 
                : 'bg-[#588B8B]/10 text-[#588B8B]'
            }`}>
              {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-[#2D3A3A]">Live Speech &amp; Audio Assistant</h4>
                {isListening ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                    Recording ({formatTime(recordingSeconds)})
                  </span>
                ) : hasRecordedAudio ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Radio className="w-3 h-3 text-emerald-600" /> Audio Ready ({formatTime(recordingSeconds)})
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-[#5A6B6B]">
                Real-time transcription + direct audio processing in Marathi, Hindi &amp; English
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center bg-white border border-[#E2E0D6] rounded-lg p-0.5 shadow-2xs">
              <span className="text-[11px] font-semibold text-[#5A6B6B] px-2 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-[#588B8B]" /> Lang:
              </span>
              {(['en-IN', 'hi-IN', 'mr-IN'] as SupportedLanguage[]).map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLanguageChange(lang)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                    selectedLang === lang
                      ? 'bg-[#588B8B] text-white shadow-xs font-semibold'
                      : 'text-[#2D3A3A] hover:bg-[#F6F5EE]'
                  }`}
                >
                  {LANGUAGE_LABELS[lang].name}
                  <span className="text-[10px] ml-1 opacity-80">({LANGUAGE_LABELS[lang].native})</span>
                </button>
              ))}
            </div>

            {/* Mic Action */}
            {isListening ? (
              <Button
                type="button"
                onClick={pauseListening}
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold h-8 rounded-lg shadow-xs"
              >
                <MicOff className="w-3.5 h-3.5 mr-1.5" /> Pause
              </Button>
            ) : (
              <Button
                type="button"
                onClick={startListening}
                size="sm"
                className="bg-[#588B8B] hover:bg-[#3D6363] text-white text-xs font-semibold h-8 rounded-lg shadow-xs"
              >
                <Mic className="w-3.5 h-3.5 mr-1.5" /> {hasRecordedAudio ? 'Resume Listening' : 'Start Listening'}
              </Button>
            )}

            <button
              type="button"
              onClick={() => setIsPanelExpanded(!isPanelExpanded)}
              className="p-1.5 text-[#5A6B6B] hover:text-[#2D3A3A] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[#E2E0D6]"
              title={isPanelExpanded ? 'Collapse Transcript' : 'Expand Transcript'}
            >
              {isPanelExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Live Decibel / Volume Meter Indicator */}
        {isListening && (
          <div className="mt-3 p-2.5 bg-white border border-rose-200/80 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-800 shrink-0">
              <Volume2 className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>Mic Active:</span>
              <span className="text-[11px] font-normal text-[#5A6B6B]">
                {audioLevel > 5 ? 'Voice Detected' : 'Speak into mic'}
              </span>
            </div>
            
            {/* Real Audio Meter Bar */}
            <div className="flex-1 max-w-xs bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
              <div 
                className={`h-full transition-all duration-75 rounded-full ${
                  audioLevel > 20 ? 'bg-emerald-500' : audioLevel > 5 ? 'bg-amber-500' : 'bg-slate-300'
                }`}
                style={{ width: `${Math.max(5, audioLevel)}%` }}
              ></div>
            </div>

            <span className="text-[11px] font-mono font-bold text-[#5A6B6B] shrink-0">
              {LANGUAGE_LABELS[selectedLang].name} ({LANGUAGE_LABELS[selectedLang].native})
            </span>
          </div>
        )}

        {/* Warning / Network Fallback Notice */}
        {speechWarning && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{speechWarning}</p>
            </div>
          </div>
        )}

        {/* Expandable Live Transcript View */}
        {isPanelExpanded && (
          <div className="mt-4 space-y-3">
            <div className="relative">
              <div className="flex items-center justify-between text-xs text-[#5A6B6B] mb-1 px-1">
                <span className="font-semibold text-[#2D3A3A] flex items-center gap-1.5">
                  Session Transcript
                  <span className="font-normal text-[11px] text-[#5A6B6B]">(Live stream &amp; editable)</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyTranscript}
                    disabled={!transcript && !interimTranscript}
                    className="hover:text-[#2D3A3A] flex items-center gap-1 disabled:opacity-40"
                  >
                    <Copy className="w-3 h-3" /> {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <span>&bull;</span>
                  <button
                    type="button"
                    onClick={handleClearTranscript}
                    disabled={!transcript && !interimTranscript && !hasRecordedAudio}
                    className="hover:text-rose-600 flex items-center gap-1 disabled:opacity-40"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
              </div>

              <div className="relative bg-white border border-[#E2E0D6] rounded-lg p-3 min-h-[90px] max-h-[180px] overflow-y-auto text-xs leading-relaxed font-sans text-[#2D3A3A] focus-within:ring-2 focus-within:ring-[#588B8B]">
                {transcript ? (
                  <span className="whitespace-pre-wrap">{transcript}</span>
                ) : null}
                {interimTranscript && (
                  <span className="text-[#588B8B] font-medium bg-[#588B8B]/10 px-1 rounded ml-1">
                    {interimTranscript}
                  </span>
                )}
                {!transcript && !interimTranscript && (
                  <p className="text-[#5A6B6B]/60 italic">
                    {isListening 
                      ? `Listening for ${LANGUAGE_LABELS[selectedLang].name} speech... Speak into the microphone.`
                      : `Click "Start Listening" to speak, or use "Transcribe Audio with Gemini" if browser speech is blocked.`}
                  </p>
                )}
              </div>
            </div>

            {/* AI Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-[#5A6B6B]">
                <Radio className="w-3.5 h-3.5 text-[#588B8B] shrink-0" />
                <span>Dual AI Mode: Convert via browser stream OR directly transcribe audio via Gemini.</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Button 1: Transcribe Audio directly with Gemini (Rock-Solid Backup) */}
                <Button
                  type="button"
                  onClick={handleTranscribeFromAudio}
                  disabled={isTranscribingAudio || (!hasRecordedAudio && !isListening)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-9 px-3.5 rounded-lg shadow-xs"
                  title="Directly sends recorded audio to Gemini for 100% accurate Marathi/Hindi/English transcription & SOAP creation"
                >
                  {isTranscribingAudio ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      Gemini Transcribing Audio...
                    </>
                  ) : (
                    <>
                      <FileAudio className="w-3.5 h-3.5 mr-1.5 text-emerald-200" />
                      Transcribe Audio with Gemini
                    </>
                  )}
                </Button>

                {/* Button 2: Generate SOAP & Keywords from Live Text */}
                <Button
                  type="button"
                  onClick={handleAnalyzeTextSession}
                  disabled={isAnalyzing || (!transcript && !interimTranscript)}
                  className="bg-gradient-to-r from-[#3D6363] to-[#588B8B] hover:opacity-95 text-white font-bold text-xs h-9 px-4 rounded-lg shadow-sm"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      Analyzing Dialogue...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-200" />
                      Generate SOAP &amp; Keywords
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Success Feedback Banner */}
            {aiSuccessMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2 rounded-lg flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-600" /> {aiSuccessMessage}
                </span>
                <span className="text-[11px] text-emerald-700 italic">Homework left blank for your assignment</span>
              </div>
            )}

            {/* Risk Notice Banner */}
            {riskAlert && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3.5 py-2.5 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded mr-1.5">
                    {riskAlert.level} Risk Flag Detected
                  </span>
                  <span className="leading-snug">{riskAlert.notes}</span>
                </div>
              </div>
            )}

            {/* Extracted Keyword Badges */}
            {extractedKeywords.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-[#5A6B6B] uppercase tracking-wider">Keywords:</span>
                {extractedKeywords.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md bg-[#588B8B]/15 text-[#2D3A3A] border border-[#588B8B]/25"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Structured SOAP Form Inputs */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* S & O */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D6363] uppercase tracking-wider flex items-center justify-between">
                <span>Subjective (S)</span>
                <span className="text-[10px] font-normal opacity-70 normal-case">Client&apos;s reported symptoms &amp; thoughts</span>
              </label>
              <Textarea 
                value={subjective} 
                onChange={e => setSubjective(e.target.value)}
                placeholder="What the client says about their feelings, stressors, and condition..."
                className="resize-none text-sm bg-[#F6F5EE]/30 focus:bg-white" 
                rows={4} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D6363] uppercase tracking-wider flex items-center justify-between">
                <span>Objective (O)</span>
                <span className="text-[10px] font-normal opacity-70 normal-case">Counselor observations, affect, speech</span>
              </label>
              <Textarea 
                value={objective} 
                onChange={e => setObjective(e.target.value)}
                placeholder="Clinical observations, body language, emotional affect..."
                className="resize-none text-sm bg-[#F6F5EE]/30 focus:bg-white" 
                rows={4} 
              />
            </div>
          </div>

          {/* A & P */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D6363] uppercase tracking-wider flex items-center justify-between">
                <span>Assessment (A)</span>
                <span className="text-[10px] font-normal opacity-70 normal-case">Clinical synthesis &amp; progress</span>
              </label>
              <Textarea 
                value={assessment} 
                onChange={e => setAssessment(e.target.value)}
                placeholder="Synthesis of S and O, psychological themes, progress..."
                className="resize-none text-sm bg-[#F6F5EE]/30 focus:bg-white" 
                rows={4} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D6363] uppercase tracking-wider flex items-center justify-between">
                <span>Plan (P)</span>
                <span className="text-[10px] font-normal opacity-70 normal-case">Next session goals &amp; interventions</span>
              </label>
              <Textarea 
                value={plan} 
                onChange={e => setPlan(e.target.value)}
                placeholder="Therapeutic direction, focus areas for upcoming sessions..."
                className="resize-none text-sm bg-[#F6F5EE]/30 focus:bg-white" 
                rows={4} 
              />
            </div>
          </div>
        </div>

        {/* Homework (Manually Managed by Counselor) & Private Notes */}
        <div className="border-t border-[#E2E0D6] pt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#8A6A4B] uppercase tracking-wider flex items-center gap-1.5">
                <span>Homework Assigned</span>
                <span className="text-[10px] font-normal text-[#8A6A4B]/80 lowercase">(counselor assigned)</span>
              </label>
              <Select value={homeworkFrequency} onValueChange={(val) => setHomeworkFrequency(val || 'once')}>
                <SelectTrigger className="w-[110px] h-6 text-[10px] border-[#EBE3D5] bg-[#FFFBF0]/50 text-[#8A6A4B] shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="once">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea 
                value={homework} 
                onChange={e => setHomework(e.target.value)}
                placeholder="Activities, reflections, or journaling assigned to client..."
                className="resize-none text-sm bg-[#FFFBF0]/50 focus:bg-white border-[#EBE3D5]" 
                rows={2} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-rose-700 uppercase tracking-wider">Private Clinical Notes</label>
            <Textarea 
                value={privateNotes} 
                onChange={e => setPrivateNotes(e.target.value)}
                placeholder="Confidential hypotheses or supervision notes (never shared with client)..."
                className="resize-none text-sm bg-rose-50/30 focus:bg-white border-rose-100" 
                rows={2} 
            />
          </div>
        </div>

        {/* Tags, Progress & Save */}
        <div className="border-t border-[#E2E0D6] pt-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2D3A3A] uppercase tracking-wider">Session Tags (Comma Separated)</label>
              <input 
                type="text" 
                value={tagsInput} 
                onChange={e => setTagsInput(e.target.value)}
                placeholder="e.g. CBT, Anxiety, Sleep Disruption"
                className="w-full text-sm px-3 py-2 border border-[#E2E0D6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#588B8B]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2D3A3A] uppercase tracking-wider">Clinical Progress</label>
              <Select value={progressRating} onValueChange={(val) => setProgressRating(val || '3')}>
                <SelectTrigger className="w-full text-sm border-[#E2E0D6] h-[38px]">
                  <SelectValue placeholder="Select Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Getting Worse</SelectItem>
                  <SelectItem value="2">2 - No Improvement</SelectItem>
                  <SelectItem value="3">3 - Slight Improvement</SelectItem>
                  <SelectItem value="4">4 - Good Progress</SelectItem>
                  <SelectItem value="5">5 - Significant Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {saved && (
              <span className="text-[#365314] bg-[#ECFCCB] border border-[#84CC16]/30 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Note &amp; Transcript Saved
              </span>
            )}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#588B8B] hover:bg-[#3D6363] text-white rounded-lg px-8 py-5 h-auto text-sm font-bold shadow-md transition-all hover:shadow-lg"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {saving ? 'Saving...' : 'Save Session Note'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
