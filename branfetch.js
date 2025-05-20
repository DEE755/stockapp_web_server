

export const getBrandLogo = async (brand_name) => {
  try {
    const response = await fetch(`https://api.brandfetch.io/v2/search/${encodeURIComponent(brand_name)}?c=1idTNDopZkrtqsiNHW0`);
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0 && data[0].icon) {
      return data[0].icon;
    }
    return null;
  } catch (error) {
    console.error('Error fetching brand logo:', error);
    return null;
  }
};



