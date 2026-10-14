import { NextRequest, NextResponse } from 'next/server'

interface AnalyzeRequest {
  transcript: string
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
            'GEMINI_API_KEY is not configured in .env.local. Please add your free Gemini API key to enable AI clinical analysis.',
        },
        { status: 400 }
      )
    }

    const body: AnalyzeRequest = await req.json()
    const { transcript, language = 'en-IN', clientName, clientIssues } = body

    if (!transcript || transcript.trim().length < 20) {
      return NextResponse.json(
        { error: 'Transcript is too short to analyze. Please provide a substantive conversation.' },
        { status: 400 }
      )
    }

    // Anonymize client name from the transcript for medical privacy
    let sanitizedTranscript = transcript.trim()
    if (clientName && clientName.trim().length > 1) {
      const nameRegex = new RegExp(clientName.trim(), 'gi')
      sanitizedTranscript = sanitizedTranscript.replace(nameRegex, '[Client]')
    }

    const isHindi = language === 'hi-IN'
    const isMarathi = language === 'mr-IN'

    const languageInstruction = isMarathi
      ? `CRITICAL LANGUAGE REQUIREMENT: The session was conducted in Marathi (मराठी). You MUST write all clinical SOAP notes ("subjective", "objective", "assessment", "plan"), clinical "tags", and "risk_assessment.notes" in pure, fluent, professional MARATHI (मराठी) using Devanagari script. Do NOT write in English.`
      : isHindi
      ? `CRITICAL LANGUAGE REQUIREMENT: The session was conducted in Hindi (हिंदी). You MUST write all clinical SOAP notes ("subjective", "objective", "assessment", "plan"), clinical "tags", and "risk_assessment.notes" in pure, fluent, professional HINDI (हिंदी) using Devanagari script. Do NOT write in English.`
      : `CRITICAL LANGUAGE REQUIREMENT: The session was conducted in English. Write all clinical notes, tags, and risk notes in professional clinical English.`

    const prompt = `You are a licensed clinical psychologist and expert mental health scribe for CounsConnect.
Analyze the following counseling session dialogue and produce structured, professional clinical documentation.

${languageInstruction}
${clientIssues && clientIssues.length > 0 ? `Known Intake Focus Areas: ${clientIssues.join(', ')}` : ''}

Session Transcript:
"""
${sanitizedTranscript}
"""

CLINICAL GUIDELINES:
1. ${languageInstruction}
2. DO NOT GENERATE HOMEWORK ASSIGNMENTS. Homework is strictly decided and assigned manually by the treating counselor. Do NOT suggest any homework in any field.
3. Extract 4 to 8 concise, accurate clinical tags in the session language (${isMarathi ? 'मराठी' : isHindi ? 'हिंदी' : 'English'}).
4. Perform a safety risk scan for any signs of self-harm, suicidal ideation, abuse, or panic crises (level: "Low" | "Medium" | "High").

Return ONLY a valid JSON object matching this schema:
{
  "subjective": "${isMarathi ? 'क्लायंटने सांगितलेल्या समस्या, भावना आणि अनुभव (मराठीत)...' : isHindi ? 'क्लाइंट द्वारा बताई गई समस्याएं, भावनाएं और अनुभव (हिंदी में)...' : 'Detailed narrative of client reported feelings and symptoms...'}",
  "objective": "${isMarathi ? 'समुपदेशकाने निरीक्षण केलेले वर्तणूक, आवाजातील चढउतार व हावभाव (मराठीत)...' : isHindi ? 'परामर्शदाता द्वारा देखे गए व्यवहारिक लक्षण, आवाज़ का लहजा व मनोदशा (हिंदी में)...' : 'Clinical observations of client affect and demeanor...'}",
  "assessment": "${isMarathi ? 'मानसिक स्थितीचे विश्लेषण, समस्यांचे मनोवैज्ञानिक मूल्यांकन व प्रगती (मराठीत)...' : isHindi ? 'मानसिक स्थिति का नैदानिक विश्लेषण, मनोवैज्ञानिक मूल्यांकन व प्रगति (हिंदी में)...' : 'Clinical synthesis of presenting challenges and progress...'}",
  "plan": "${isMarathi ? 'पुढील सत्रासाठी समुपदेशन उद्दिष्टे आणि उपचारात्मक दिशा (मराठीत)...' : isHindi ? 'अगले सत्र के लिए चिकित्सीय योजना और ध्यान देने योग्य विषय (हिंदी में)...' : 'Therapeutic focus areas for the upcoming session...'}",
  "tags": ["${isMarathi ? 'टॅग १' : isHindi ? 'टैग १' : 'Tag1'}", "${isMarathi ? 'टॅग २' : isHindi ? 'टैग २' : 'Tag2'}"],
  "risk_assessment": {
    "level": "Low" | "Medium" | "High",
    "notes": "${isMarathi ? 'सुरक्षा/जोखीम संदर्भातील टिप (मराठीत)' : isHindi ? 'सुरक्षा/जोखिम संबंधी टिप्पणी (हिंदी में)' : 'Clinical note regarding risk'}"
  }
}`

    // Attempt generation with verified active Gemini Flash models
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
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        })

        if (!res.ok) {
          const errBody = await res.text()
          lastError = `Model ${model} returned ${res.status}: ${errBody}`
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
            'Failed to generate analysis from Gemini. Please verify your API key and quota: ' +
            (lastError || 'Unknown error'),
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error: any) {
    console.error('Session analysis error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error while analyzing session transcript' },
      { status: 500 }
    )
  }
}
