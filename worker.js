export default {

    async fetch(request, env, ctx) {
        try {
            const url = request.url.split("?")[0]
            const [endpoint] = url.split("/").slice(-1)

            const object = await env.AGE_BUCKET.get(endpoint);
            if (!object) {
                return new Response('File not found', { status: 404 });
            }

            const body = await object.arrayBuffer();
            return new Response(body, {
                headers: {
                    'Content-Type': 'text/html',
                },
            });
        } catch (err) {
            return new Response('Error fetching file', { status: 500 });
        }
    }
}
