const https = require('https');

async function debugLodgify() {
    const apiKey = 'K2C06LyfvN9Hm7SQSsea3Kl7wzAttVWE/p5nndCdIm1JRM707gDt/NbuUJC51OK0';
    
    // 1. Ambil list properti dulu
    const options = {
        hostname: 'api.lodgify.com',
        path: '/v2/properties',
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
            const data = JSON.parse(body);
            if (data.items && data.items.length > 0) {
                const firstId = data.items[0].id;
                console.log(`Testing with ID: ${firstId}`);
                
                // 2. Coba fetch detailnya langsung
                const detailOptions = {
                    hostname: 'api.lodgify.com',
                    path: `/v2/properties/${firstId}`,
                    method: 'GET',
                    headers: {
                        'X-ApiKey': apiKey,
                        'Accept': 'application/json',
                    }
                };
                
                const detailReq = https.request(detailOptions, detailRes => {
                    console.log(`Detail API Response Status: ${detailRes.statusCode}`);
                    let detailBody = '';
                    detailRes.on('data', d => detailBody += d);
                    detailRes.on('end', () => {
                        console.log('Detail Data Sample:', detailBody.substring(0, 200));
                    });
                });
                detailReq.end();
            }
        });
    });
    req.end();
}

debugLodgify();
