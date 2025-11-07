import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { courses, clubs, goals } = await request.json();

    // Validate input
    if (!goals || !goals.trim()) {
      return NextResponse.json(
        { error: 'Goals are required' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in your .env.local file.' },
        { status: 500 }
      );
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build the prompt
    let prompt = `You are a helpful academic advisor and schedule planner. Based on the following information, provide personalized recommendations and insights.\n\n`;

    if (courses && courses.length > 0) {
      prompt += `Courses:\n`;
      courses.forEach((course: { name: string; time: string }) => {
        prompt += `- ${course.name} (${course.time})\n`;
      });
      prompt += `\n`;
    }

    if (clubs && clubs.length > 0) {
      prompt += `Clubs/Activities:\n`;
      clubs.forEach((club: { name: string; time: string }) => {
        prompt += `- ${club.name} (${club.time})\n`;
      });
      prompt += `\n`;
    }

    prompt += `Goals and Objectives:\n${goals}\n\n`;
    prompt += `Please provide:\n`;
    prompt += `1. A brief analysis of their schedule and goals\n`;
    prompt += `2. Time management recommendations\n`;
    prompt += `3. Suggestions for balancing coursework and activities\n`;
    prompt += `4. Actionable steps to achieve their goals\n`;
    prompt += `5. Any potential conflicts or challenges to watch out for\n\n`;
    prompt += `Be concise, practical, and encouraging in your response.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    if (error instanceof Error) {
      // Handle specific Gemini API errors
      if (error.message.includes('API_KEY')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your GEMINI_API_KEY in .env.local' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to get AI response: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

