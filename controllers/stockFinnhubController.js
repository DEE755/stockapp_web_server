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


export const getMovingAverages = async (symbol) => {
  console.log("enterede getMoving for symbol:", symbol);

  const resolution = 'D'; // Daily resolution
  try {
    const from = Math.floor(new Date('2022-01-01').getTime() / 1000); // Unix timestamp
    const to = Math.floor(Date.now() / 1000); // Current time

    async function fetchSMA(timeperiod) {
      const url = `https://finnhub.io/api/v1/indicator?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&indicator=sma&timeperiod=${timeperiod}&token=${process.env.STOCK_API_KEY}`;
      console.log(url);

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      return data.sma?.at(-1); // latest value
    }

    // Fetch moving averages directly
    const ma25 = await fetchSMA(25);
    const ma50 = await fetchSMA(50);
    const ma150 = await fetchSMA(150);
    const ma200 = await fetchSMA(200);

    console.log("MA25:", ma25);
    console.log("MA50:", ma50);
    console.log("MA150:", ma150);
    console.log("MA200:", ma200);

    return {
      ma25,
      ma50,
      ma150,
      ma200
    };

  } catch (error) {
    console.error('Error fetching moving averages:', error);
    return null;
  }
};




