import fetch from 'node-fetch';

export const getCurrentPrice = (symbol) => {
  return new Promise((resolve, reject) => {
    const url = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=' + symbol + '&interval=5min&apikey=' + process.env.ALPHAWANTAGE_KEY;

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const timeSeries = data["Time Series (1min)"];
        if (!timeSeries) {
          reject(new Error('No time series data found'));
          return;
        }
        const latestTimestamp = Object.keys(timeSeries)[0];
        const latestData = timeSeries[latestTimestamp];
        const currentPrice = latestData["4. close"];
        console.log("Current price:", currentPrice);
        resolve(currentPrice);
      })
      .catch(err => {
        console.log('Error:', err);
        reject(err);
      });
  });
};
