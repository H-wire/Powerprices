const convertUTCDateToLocalDate = (date) => {
  const newDate = new Date(
    date.getTime() + date.getTimezoneOffset() * 60 * 1000
  );

  const offset = date.getTimezoneOffset() / 60;
  const hours = date.getHours();

  newDate.setHours(hours - offset);

  return newDate;
};

const toggleBasedOnCheapestHours = async (firstRun = false) => {
  const currentMinutes = new Date().getMinutes();
  if (currentMinutes > 0 && !firstRun) {
    return;
  }

  const currentLocalDate = convertUTCDateToLocalDate(new Date()).toISOString().split("T")[0];
  const currentHour = new Date().getHours();
  const response = await fetch(
    `https://api.energidataservice.dk/dataset/elspotprices?start=${currentLocalDate}T00:00&end=${currentLocalDate}T23:59&columns=HourUTC%2CSpotPriceEUR&filter=%7B%22PriceArea%22%3A%20%22SE3%22%7D`
  );

  const { records } = await response.json();

  if (records.length > 0) {
    const sortedHours = records
      .sort((a, b) => a.SpotPriceEUR - b.SpotPriceEUR)
      .slice(0, 14);
    const cheapestHours = sortedHours.map(({ HourUTC }) =>
      new Date(HourUTC).getHours()
    );

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
