import yahooFinance from 'yahoo-finance2';

export async function getCurrentPrice(symbol) {// this function will be live used and not only put in the db like the other ones for faster access
  try {
    const quote = await yahooFinance.quote(symbol);
    // The current price is usually in 'regularMarketPrice'
    
    return quote.regularMarketPrice;


  } catch (error) {
    console.error('Error fetching current price for', symbol, error.message);
    return null;
  }
}

export async function yahooGetFourMovingAverages(symbol) {
  try {
    const result = await yahooFinance.chart(symbol, {
      period1: '2023-01-01',
      interval: '1d'
    });

    const closePrices = result.quotes.map(day => day.close);

    function calculateSMA(data, windowSize) {
      const sma = [];
      for (let i = windowSize - 1; i < data.length; i++) {
        const window = data.slice(i - windowSize + 1, i + 1);
        const avg = window.reduce((a, b) => a + b, 0) / windowSize;
        sma.push(avg);
      }
      return sma;
    }

    const ma25 = calculateSMA(closePrices, 25);
    const ma50 = calculateSMA(closePrices, 50);
    const ma150 = calculateSMA(closePrices, 150);
    const ma200 = calculateSMA(closePrices, 200);

    console.log("MA25:", ma25.at(-1));
    console.log("MA50:", ma50.at(-1));
    console.log("MA150:", ma150.at(-1));
    console.log("MA200:", ma200.at(-1));

    // Return the latest moving averages

    return {
      ma25: ma25.at(-1),
      ma50: ma50.at(-1),
      ma150: ma150.at(-1),
      ma200: ma200.at(-1)
    };
  } catch (error) {
    console.error('Error fetching data for symbol:', symbol, error.message);
    return null;
  }
}
  
