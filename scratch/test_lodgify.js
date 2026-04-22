const https = require('https');

async function testLodgify() {
    const apiKey = 'K2C06LyfvN9Hm7SQSsea3Kl7wzAttVWE/p5nndCdIm1JRM707gDt/NbuUJC51OK0';
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
                const p = data.items[0];
                console.log('Searching for URLs in property data...');
                for (const [key, value] of Object.entries(p)) {
                    if (typeof value === 'string' && (value.includes('http') || value.includes('.com'))) {
                        console.log(`${key}: ${value}`);
                    }
                }
            }
        });
    });
    req.end();
}

testLodgify();
