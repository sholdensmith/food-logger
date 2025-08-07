// app/api/logFood/route.js
import OpenAI from "openai";
import { supabase, FOOD_ENTRIES_TABLE } from "../../../lib/supabase";

// instantiate once at module scope
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { food, userId, date } = await request.json();
    
    if (!food) {
      return new Response(
        JSON.stringify({ error: "Missing `food` in request body." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing `userId` in request body." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get nutrition data from OpenAI using GPT-4o
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a nutrition assistant. Given a food description, analyze the food item and return valid JSON with keys: calories (number), protein (g), carbs (g), fats (g). Use reasoning to estimate accurate nutrition values based on typical serving sizes and food composition. Always return valid JSON format.",
        },
        { role: "user", content: `Nutrition facts for: "${food}"` },
      ],
      temperature: 0.1,
    });

    const responseContent = completion.choices[0].message.content.trim();
    console.log('OpenAI response:', responseContent);
    
    let nutrition;
    try {
      nutrition = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response content:', responseContent);
      return new Response(
        JSON.stringify({ error: "Failed to parse nutrition data from AI response." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create entry with timestamp
    const entryDate = date || new Date().toISOString().slice(0, 10);
    const entry = {
      id: crypto.randomUUID(),
      user_id: userId,
      description: food,
      date: entryDate,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fats: nutrition.fats,
      created_at: new Date().toISOString(),
    };

    // Save to database
    const { data, error } = await supabase
      .from(FOOD_ENTRIES_TABLE)
      .insert(entry)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: "Failed to save entry to database." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Failed to process request." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date') || new Date().toISOString().slice(0, 10);

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing `userId` parameter." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch entries for the user and date
    const { data, error } = await supabase
      .from(FOOD_ENTRIES_TABLE)
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch entries." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch entries." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!entryId) {
      return new Response(
        JSON.stringify({ error: "Missing `id` parameter." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing `userId` parameter." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Delete the entry (only if it belongs to the user)
    const { error } = await supabase
      .from(FOOD_ENTRIES_TABLE)
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId);

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: "Failed to delete entry." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Failed to delete entry." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
