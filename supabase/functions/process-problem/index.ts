import "jsr:@supabase/functions-js/edge-runtime.d.ts";


const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { problem } = await req.json();
        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
        const systemPrompt = `
You are an expert AI workflow, website and solution architect working for AIstride. 
Your job is to take a messy description of a problem a business or a business owner is facing and convert it to a software based solution powered by AI.
You should output three sections,
1. A clear one paragraph summary of the problem
2. A clear step by step explanation of how it can be solved
3. A clear and concise explanation of the solution. 

Your output should be in JSON format with the following keys,
"summary" - The summary of the problem
"solution" - The step by step explanation of the solution
"explanation" - The explanation of the solution
`;

        if (!GEMINI_API_KEY) {
            return Response.json(
                { error: "Missing GEMINI_API_KEY" },
                { status: 500, headers: corsHeaders }
            );
        }

        const aiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: systemPrompt }],
                    },
                    contents: [
                        {
                            parts: [{ text: problem }],
                        },
                    ],
                    generationConfig: {
                        response_mime_type: "application/json",
                    },
                }),
            }
        );

        const data = await aiResponse.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
            return Response.json(
                { error: "Invalid or empty response from AI" },
                { status: 500, headers: corsHeaders }
            );
        }

        let parsedData;

        try {
            parsedData = JSON.parse(rawText);
        } catch (error) {
            console.error("JSON parsing error:", error);
            return Response.json(
                { error: "AI returned invalid JSON" },
                { status: 500, headers: corsHeaders }
            );
        }

        return Response.json(parsedData, { headers: corsHeaders });
    } catch (err: any) {
        return Response.json(
            { error: err.message || "An unexpected error occurred" },
            { status: 400, headers: corsHeaders }
        );
    }
});

