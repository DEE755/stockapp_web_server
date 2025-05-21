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


export const getLogoFromLogoDev2 = async (tickerSymbol) => {
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



//RECUSIVE FUNCTION TO GET LOGO FROM LOGODEV WITH SEVERAL NAME ATTEMPTS
export const getLogoFromLogoDev = async (brand_name) => {
  try {
    var length = brand_name.trim().split(/\s+/).length;
    if (brand_name.trim().length<1) return null;//stop recursion

 const response = await fetch(`https://api.logo.dev/search?q=${brand_name}`, {
  headers: {
    "Authorization": `Bearer: ${process.env.LOGODEVPRIVATEKEY}`,
  }
})
    const data = await response.json();
    //console.error('Response', response);
    console.log('Trying with:',brand_name);
    if (Array.isArray(data) && data.length > 0 && data[0].logo_url) {
      return data[0].logo_url;
    }

    return await getLogoFromLogoDev(brand_name.split(' ').slice(0, length-1).join(' '))
      
     
}
   catch (error) {
    console.error('Error fetching brand logo:', error);
    return null;
  }
};


