// proxy-server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// 启用 CORS
app.use(cors());
app.use(express.json());

// 代理端点
app.post('/api/search', async (req, res) => {
  try {
    const { apiKey, query, numResults = 10 } = req.body;
    
    if (!apiKey || !query) {
      return res.status(400).json({ error: 'API Key and query are required.' });
    }

    console.log(`Forwarding search request for query: "${query}"`);
    
    const response = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        query,
        numResults,
        includeRawContent: true,
        text: true
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`Exa API error: ${response.status}`, data);
      return res.status(response.status).json(data);
    }

    console.log(`Successfully fetched ${data.results?.length || 0} results`);
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy server error:', error);
    res.status(500).json({ error: 'Failed to fetch from Exa API' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
  console.log(`API endpoint available at http://localhost:${PORT}/api/search`);
});
