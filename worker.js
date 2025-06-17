const objectKey = 'index.html';

export default {

    async fetch(request, env, ctx) {
        try {
            const object = await env.AGE_BUCKET.get(objectKey);
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
