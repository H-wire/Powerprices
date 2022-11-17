const toggleBasedOnCheapestHours = async (firstRun = false) => {
  const currentMinutes = new Date().getMinutes();
  if (currentMinutes > 0 && !firstRun) {
    return;
  }

  const currentDate = new Date().toISOString().split("T")[0];
  const currentHour = new Date().getHours();
  const response = await fetch(
    `https://api.energidataservice.dk/dataset/elspotprices?start=${currentDate}T00:00&end=${currentDate}T23:00&columns=HourUTC%2CSpotPriceEUR&filter=%7B%22PriceArea%22%3A%20%22SE3%22%7D`
  );

  const { records } = await response.json();

  if (records.length > 0) {
    const sortedHours = records
      .sort((a, b) => a.SpotPriceEUR - b.SpotPriceEUR)
      .slice(0, 8);
    const cheapestHours = sortedHours.map(({ SpotPriceEUR }) => SpotPriceEUR);

    console.log(sortedHours);

    if (cheapestHours.includes(currentHour)) {
      console.log(new Date().toISOString(), "Turning on");
      fetch("http://192.168.1.73/rpc/Switch.Set?id=0&on=false");
      return;
    }

    console.log(new Date().toISOString(), "Turning off");
    fetch("http://192.168.1.73/rpc/Switch.Set?id=0&on=true");
    return;
  }

  console.log("Error: Could not fetch prices");
};

toggleBasedOnCheapestHours(true);
setInterval(toggleBasedOnCheapestHours, 60000);
