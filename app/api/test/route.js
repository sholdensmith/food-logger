import { supabase } from "../../../lib/supabase";

export async function GET() {
  try {
    // Test the connection by running a simple query
    const { error } = await supabase
      .from('food_entries')
      .select('count')
      .limit(1);

    if (error) {
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: 'Database connection failed', 
          error: error.message 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        status: 'success', 
        message: 'Database connection successful',
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: 'Server error', 
        error: err.message 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
} 