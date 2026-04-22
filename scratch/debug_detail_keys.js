const https = require('https');

async function debugPropertyDetail() {
    const apiKey = 'K2C06LyfvN9Hm7SQSsea3Kl7wzAttVWE/p5nndCdIm1JRM707gDt/NbuUJC51OK0';
    const propertyId = '475365';
    
    const options = {
        hostname: 'api.lodgify.com',
        path: `/v2/properties/${propertyId}`,
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
            console.log('--- DEBUG PROPERTY DETAIL ---');
            try {
                const data = JSON.parse(body);
                console.log('Keys available:', Object.keys(data));
                if (data.images) {
                    console.log('Found "images" key! Count:', data.images.length);
                }
                if (data.rooms) {
                    console.log('Found "rooms" key!');
                }
            } catch (e) {
                console.log('Error parsing:', e.message);
            }
        });
    });
    req.end();
}

debugPropertyDetail();
