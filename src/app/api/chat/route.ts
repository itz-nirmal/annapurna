import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages, inventory } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Annapurna Pantry Recipe Bot'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1',
        messages: [
          {
            role: 'system',
            content: `You are a helpful and knowledgeable recipe generator bot for Annapurna Pantry. You can:

1. Generate recipes based on user requests
2. Suggest recipes using available pantry ingredients
3. Provide cooking tips and techniques
4. Answer food-related questions
5. Help with meal planning
6. Provide nutritional information
7. Suggest ingredient substitutions

Available pantry items: ${inventory?.map((item: { name: string; quantity: number; unit: string }) => `${item.name} (${item.quantity} ${item.unit})`).join(', ') || 'None available'}

Keep responses helpful, concise, and practical. Always be friendly and encouraging. If asked about non-food topics, politely redirect to cooking and recipes.`
          },
          ...messages
        ],
        max_tokens: 800,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API Error:', response.status, errorData);
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response right now. Please try again.';

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}