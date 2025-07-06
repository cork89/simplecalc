export default {

    async fetch(request, env, ctx) {
        try {
            const url = new URL(request.url);
            let objectKey = url.pathname.slice(1);

            if (objectKey === '' || objectKey.endsWith('/')) {
                objectKey += 'index.html';
            }

            if (!objectKey.includes('.') && objectKey.lastIndexOf('/') < objectKey.length - 1) {
                objectKey += '.html';
            }

            const object = await env.AGE_BUCKET.get(objectKey);
            if (!object) {
                return new Response('File not found', { status: 404 });
            }

            const contentType = getContentType(objectKey)
            const cacheControl = getCacheControl(objectKey)

            const headers = {
                'Content-Type': contentType,
                'Cache-Control': cacheControl,
            }

            if (object.etag) {
                headers['ETag'] = object.etag;
            }
            if (object.uploaded) {
                headers['Last-Modified'] = new Date(object.uploaded).toUTCString();
            }

            const body = await object.arrayBuffer();
            return new Response(body, {
                headers: headers,
            })
        } catch (err) {
            return new Response('Error fetching file', { status: 500 });
        }
    }
}

/**
 * Helper function to determine the Content-Type header based on file type.
 * @param {string} filename The name of the file.
 * @returns {string} The appropriate Content-Type header value.
 */
function getContentType(filename) {
    const extension = filename.split('.').pop().toLowerCase();

    switch (extension) {
        case 'html':
            return 'text/html';
        case 'css':
            return 'text/css';
        case 'js':
            return 'application/javascript';
        case 'json':
            return 'application/json';
        case 'png':
            return 'image/png';
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'gif':
            return 'image/gif';
        case 'svg':
            return 'image/svg+xml';
        case 'ico':
            return 'image/x-icon';
        case 'webp':
            return 'image/webp';
        case 'xml':
            return 'application/xml';
        case 'pdf':
            return 'application/pdf';
        // Fonts
        case 'woff':
            return 'font/woff';
        case 'woff2':
            return 'font/woff2';
        case 'ttf':
            return 'font/ttf';
        case 'eot':
            return 'application/vnd.ms-fontobject';
        case 'otf':
            return 'font/otf';
        // Add more types as needed
        default:
            return 'application/octet-stream'; // Default for unknown types (generic binary)
    }
}

/**
 * Helper function to determine the Cache-Control header based on file type.
 * @param {string} filename The name of the file.
 * @returns {string} The appropriate Cache-Control header value.
 */
function getCacheControl(filename) {
    const extension = filename.split('.').pop().toLowerCase();

    switch (extension) {
        case 'html':
            return 'public, max-age=0, must-revalidate, s-maxage=60';
        case 'css':
        case 'js':
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'svg':
        case 'ico':
        case 'webp':
        case 'woff':
        case 'woff2':
        case 'ttf':
        case 'eot':
        case 'otf':
            return 'public, max-age=31536000, immutable';
        case 'json':
        case 'xml':
        case 'pdf':
            return 'public, max-age=3600';
        default:
            return 'public, max-age=0, must-revalidate';
    }
}