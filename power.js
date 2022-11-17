const toggleBasedOnCheapestHours = async () => {
  const currentDate = new Date().toISOString().split("T")[0];
  const currentHour = new Date().getHours();
  const response = await fetch(
    `https://api.energidataservice.dk/dataset/elspotprices?start=${currentDate}T00:00&end=${currentDate}T23:00&columns=HourUTC%2CSpotPriceEUR&filter=%7B%22PriceArea%22%3A%20%22SE3%22%7D`
  );

  const { records } = await response.json();

  if (records.length > 0) {
    const cheapestHours = records
      .sort((a, b) => a.SpotPriceEUR - b.SpotPriceEUR)
      .map(({ SpotPriceEUR }) => SpotPriceEUR)
      .slice(0, 8);
    if (cheapestHours.includes(currentHour)) {
      console.log("Turning on");
      fetch("http://192.168.1.73/rpc/Switch.Set?id=0&on=false");
      return;
    }

    console.log("Turning off");
    fetch("http://192.168.1.73/rpc/Switch.Set?id=0&on=true");
    return;
  }

  console.log("Error: Could not fetch prices");
};

// Run immediately and every hour
toggleBasedOnCheapestHours();
setInterval(toggleBasedOnCheapestHours, 3600000);
