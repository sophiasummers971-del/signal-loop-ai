import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { skills, interests, hoursPerWeek, incomeGoal, workStyle } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert business strategist and opportunity detector. Given a user's profile, generate exactly 5 micro-business ideas they can start with minimal investment.

For each idea, return a JSON array of objects with these fields:
- title: catchy name for the micro-business (string)
- audience: target audience description (string)
- problem: what problem this solves (string)
- monetization: how they'll make money (string)
- mvp_steps: array of 4 specific actionable steps to launch (string[])
- match_score: how well it matches their profile, 70-98 (number)

Return ONLY a valid JSON array, no markdown, no explanation.`;

    const userPrompt = `User Profile:
- Skills: ${skills?.join(", ") || "Not specified"}
- Interests: ${interests?.join(", ") || "Not specified"}
- Available time: ${hoursPerWeek || "Not specified"} hours/week
- Income goal: $${incomeGoal || "Not specified"}/month
- Work style: ${workStyle || "Not specified"}

Generate 5 tailored micro-business ideas.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    // Parse the JSON from the AI response
    let ideas;
    try {
      // Strip markdown code fences if present
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      ideas = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      ideas = [];
    }

    return new Response(JSON.stringify({ ideas }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-ideas error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
