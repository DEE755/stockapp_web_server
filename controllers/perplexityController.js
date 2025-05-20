import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

export const askAIPerplexity = async (req, res) => {
  const { question } = req.body;

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: 'Be precise and concise.' },
          { role: 'user', content: question }
        ]
      })
    });

    const data = await response.json();
    res.json({ reply: data.choices?.[0]?.message?.content || 'No reply received.' });
  } catch (error) {
    console.error('Error fetching response from Perplexity:', error);
    res.status(500).send('Error getting AI reply');
  }
};
