import { NextRequest, NextResponse } from 'next/server'

interface TranscribeAudioRequest {
  audioBase64: string
  mimeType?: string
  language?: 'mr-IN' | 'hi-IN' | 'en-IN' | string
  clientName?: string
  clientIssues?: string[]
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY is not configured in .env.local. Please add your free Gemini API key from https://aistudio.google.com/',
        },
        { status: 400 }
      )
    }

    const body: TranscribeAudioRequest = await req.json()
    const { audioBase64, mimeType = 'audio/webm', language = 'en-IN', clientName, clientIssues } = body

    if (!audioBase64 || audioBase64.length < 100) {
      return NextResponse.json(
        { error: 'No audio data received or recording was too short.' },
        { status: 400 }
      )
    }

    // Clean mime-type for Gemini (remove codecs parameter if present)
    const cleanMimeType = mimeType.split(';')[0].trim() || 'audio/webm'

    const isHindi = language === 'hi-IN'
    const isMarathi = language === 'mr-IN'

    const languageInstruction = isMarathi
      ? `CRITICAL LANGUAGE REQUIREMENT: The audio was spoken in Marathi (मराठी). You MUST produce:
1. The "transcript" verbatim in pure MARATHI (मराठी) in Devanagari script.
2. All clinical SOAP sections ("subjective", "objective", "assessment", "plan") in pure, fluent, professional MARATHI (मराठी) in Devanagari script.
3. Clinical "tags" in MARATHI (मराठी).
4. "risk_assessment.notes" in MARATHI (मराठी).
Do NOT translate or output in English.`
      : isHindi
      ? `CRITICAL LANGUAGE REQUIREMENT: The audio was spoken in Hindi (हिंदी). You MUST produce:
1. The "transcript" verbatim in pure HINDI (हिंदी) in Devanagari script.
2. All clinical SOAP sections ("subjective", "objective", "assessment", "plan") in pure, fluent, professional HINDI (हिंदी) in Devanagari script.
3. Clinical "tags" in HINDI (हिंदी).
4. "risk_assessment.notes" in HINDI (हिंदी).
Do NOT translate or output in English.`
      : `CRITICAL LANGUAGE REQUIREMENT: The audio was spoken in English. Produce the transcript, clinical SOAP note, tags, and risk notes in professional clinical English.`

    const prompt = `You are a licensed clinical psychologist and expert mental health medical scribe for CounsConnect.
Listen carefully to the attached counseling session audio recording.

${languageInstruction}
${clientIssues && clientIssues.length > 0 ? `Client Focus Areas: ${clientIssues.join(', ')}` : ''}

TASK:
1. Transcribe the entire spoken conversation verbatim into the "transcript" field in the spoken language (${isMarathi ? 'मराठी' : isHindi ? 'हिंदी' : 'English'}).
2. Synthesize a professional clinical SOAP note in the EXACT SAME LANGUAGE (${isMarathi ? 'मराठीत' : isHindi ? 'हिंदी में' : 'English'}):
   - "subjective": Client's self-reported feelings, somatic symptoms, narratives, and stressors (${isMarathi ? 'मराठीत' : isHindi ? 'हिंदी में' : 'English'}).
   - "objective": Client's vocal tone, affect, speech pace, and emotional indicators observed in the audio (${isMarathi ? 'मराठीत' : isHindi ? 'हिंदी में' : 'English'}).
   - "assessment": Clinical synthesis, psychological themes, coping mechanisms, and progress (${isMarathi ? 'मराठीत' : isHindi ? 'हिंदी में' : 'English'}).
   - "plan": Therapeutic focus areas and modality interventions for the next session (${isMarathi ? 'मराठीत' : isHindi ? 'हिंदी में' : 'English'}).
3. "tags": 4 to 8 concise clinical keyword tags in ${isMarathi ? 'मराठी' : isHindi ? 'हिंदी' : 'English'}.
4. "risk_assessment": Safety scan for self-harm, suicidal ideation, or crisis ("level": "Low"|"Medium"|"High", "notes": "...").
5. STRICT RULE: DO NOT GENERATE OR SUGGEST ANY HOMEWORK ASSIGNMENTS. Homework is strictly decided manually by the counselor.

Return ONLY a valid JSON object matching this schema:
{
  "transcript": "${isMarathi ? 'ऑडिओमधून ऐकलेले संपूर्ण संभाषण मराठीत...' : isHindi ? 'ऑडियो से सुना गया पूरा संवाद हिंदी में...' : 'Full verbatim transcription...'}",
  "subjective": "...",
  "objective": "...",
  "assessment": "...",
  "plan": "...",
  "tags": ["${isMarathi ? 'टॅग १' : isHindi ? 'टैग १' : 'Tag1'}", "${isMarathi ? 'टॅग २' : isHindi ? 'टैग २' : 'Tag2'}"],
  "risk_assessment": {
    "level": "Low" | "Medium" | "High",
    "notes": "${isMarathi ? 'सुरक्षा/जोखीम संदर्भातील टिप (मराठीत)' : isHindi ? 'सुरक्षा/जोखिम संबंधी टिप्पणी (हिंदी में)' : 'Clinical note regarding risk'}"
  }
}`

    const modelsToTry = [
      'gemini-flash-lite-latest',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
      'gemini-flash-latest',
    ]
    let responseData: any = null
    let lastError: string | null = null

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inline_data: {
                      mime_type: cleanMimeType,
                      data: audioBase64,
                    },
                  },
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        })

        if (!res.ok) {
          const errText = await res.text()
          lastError = `Model ${model} returned ${res.status}: ${errText}`
          continue
        }

        const data = await res.json()
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (textResponse) {
          responseData = JSON.parse(textResponse)
          break
        }
      } catch (err: any) {
        lastError = err?.message || String(err)
      }
    }

    if (!responseData) {
      return NextResponse.json(
        {
          error:
            'Failed to transcribe audio with Gemini: ' + (lastError || 'Unknown error. Check API key and quota.'),
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error: any) {
    console.error('Audio transcription error:', error)
    return NextResponse.json(
      { error: error?.message || 'Server error while transcribing audio' },
      { status: 500 }
    )
  }
}
