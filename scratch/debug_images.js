const https = require('https');

async function debugImages() {
    const apiKey = 'K2C06LyfvN9Hm7SQSsea3Kl7wzAttVWE/p5nndCdIm1JRM707gDt/NbuUJC51OK0';
    const propertyId = '475365';
    
    const options = {
        hostname: 'api.lodgify.com',
        path: `/v2/properties/${propertyId}/images`,
        method: 'GET',
        headers: {
            'X-ApiKey': apiKey,
            'Accept': 'application/json',
        }
    };

    const req = https.request(options, res => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
            console.log('--- DEBUG IMAGES ---');
            console.log('Status:', res.statusCode);
            try {
                const data = JSON.parse(body);
                console.log('Is Array?', Array.isArray(data));
                console.log('Data Type:', typeof data);
                if (Array.isArray(data)) {
                    console.log('Count:', data.length);
                    if (data.length > 0) console.log('First Item keys:', Object.keys(data[0]));
                } else {
                    console.log('Keys:', Object.keys(data));
                }
            } catch (e) {
                console.log('Body:', body.substring(0, 100));
            }
        });
    });
    req.end();
}

debugImages();
