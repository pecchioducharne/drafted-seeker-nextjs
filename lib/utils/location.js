export const getUserCountry = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      console.log("User is in country " + data.country);
      return data.country; // returns 'US' if in the United States
    } catch (err) {
      console.error('Failed to fetch location:', err);
      return null;
    }
  };