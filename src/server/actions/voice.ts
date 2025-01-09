'use server'

import { Groq } from 'groq-sdk';
import { Uploadable } from 'groq-sdk/uploads.mjs';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function processAudio(audioBlob: Blob): Promise<boolean> {
  try {

    const response = await groq.audio.transcriptions.create({
        model: "whisper-large-v3-turbo",
        temperature: 0,
        file: audioBlob as unknown as Uploadable
    });

    const transcribedText = response.text;
    
    // Check if the transcribed word is "hey"
    return transcribedText === 'hey';
  } catch (error) {
    console.error('Error processing audio:', error);
    return false;
  }
}