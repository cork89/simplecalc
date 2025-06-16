addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const objectKey = 'index.html';

    try {
        const object = await AGE_CALCULATOR.get(objectKey);
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