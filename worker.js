export default {
  async fetch(request, env, ctx) {
    if (!env.COMPLAINTS) {
      return new Response('Worker Error: KV namespace not bound', { status: 500 })
    }

    const url = new URL(request.url)
    if (url.pathname !== '/sikayet') {
      return new Response('Not found', { status: 404 })
    }

    if (request.method === 'POST') {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }

      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: corsHeaders
        })
      }

      try {
        const data = await request.json()
        
        try {
          const key = `complaint-${Date.now()}`
          await env.COMPLAINTS.put(key, JSON.stringify({
            ...data,
            timestamp: new Date().toISOString()
          }))

          return new Response(JSON.stringify({ success: true }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          })
        } catch (kvError) {
          return new Response(JSON.stringify({ error: 'Storage error', details: kvError.message }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          })
        }
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Invalid request' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        })
      }
    }

    return new Response('Method not allowed', { status: 405 })
  }
}
