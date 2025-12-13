// Cloudflare Worker - Sakinah AI Proxy
// This proxies requests to Groq API with rate limiting

export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders 
      });
    }

    try {
      // Get request body
      const body = await request.json();
      
      // Basic rate limiting by IP (optional but recommended)
      const clientIP = request.headers.get('CF-Connecting-IP');
      const rateLimitKey = `ratelimit:${clientIP}`;
      
      // Check rate limit (10 requests per minute per IP)
      if (env.RATE_LIMIT) {
        const count = await env.RATE_LIMIT.get(rateLimitKey);
        if (count && parseInt(count) > 10) {
          return new Response(JSON.stringify({ 
            error: 'Rate limit exceeded. Please try again later.' 
          }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // Increment counter
        const newCount = count ? parseInt(count) + 1 : 1;
        await env.RATE_LIMIT.put(rateLimitKey, newCount.toString(), { expirationTtl: 60 });
      }

      // Call Groq API with your secret key
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.GROQ_API_KEY}` // Secret from environment
        },
        body: JSON.stringify(body)
      });

      const data = await groqResponse.json();
      
      return new Response(JSON.stringify(data), {
        status: groqResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
