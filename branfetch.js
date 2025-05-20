import dotenv from 'dotenv';
dotenv.config();


export const getBrandLogo = async (brand_name) => {
  try {
    const response = await fetch(`https://api.brandfetch.io/v2/search/${encodeURIComponent(brand_name)}?c=1idTNDopZkrtqsiNHW0`);
    const data = await response.json();
    console.error('Response', response);
    if (Array.isArray(data) && data.length > 0 && data[0].icon) {
      return data[0].icon;
    }
    return null;
  } catch (error) {
    console.error('Error fetching brand logo:', error);
    return null;
  }
};


export const getLogoFromLogoDev = async (tickerSymbol) => {
try {

const publicToken = process.env.LOGODEVPUBLICKEY;
const logoUrl = `https://img.logo.dev/ticker/${tickerSymbol}?token=${publicToken}`;

if (logoUrl) return logoUrl;
  return null;
  
} catch (error) 
{
  console.error('Error fetching brand logo:', error);
    return null;
  
}

};



