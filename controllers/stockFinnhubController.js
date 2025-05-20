import fetch from 'node-fetch';

export const getStocks = async (req, res) => {
  try {
    const response = await fetch(`https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${process.env.STOCK_API_KEY}`);
    const data = await response.json();

    //clean if needed choose the fields you want to return and replace with res.json(cleaned)
    //const cleaned = data.map(item => ({
    //  symbol: item.symbol,
    //  name: item.description
    //}));

    res.json(data);
  } catch (error) {
    console.error('Error fetching stock symbols:', error);
    res.status(500).json({ error: 'Failed to load stock symbols' });
  }
};
