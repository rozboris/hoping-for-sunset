const getCoords = async (useCache = true) => {
  if (useCache) {
    const storedLocation = localStorage.getItem("location");
    if (storedLocation) {
      return JSON.parse(storedLocation);
    }
  }
  const pos = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
  const latlon = {
    lat: pos.coords.latitude,
    lon: pos.coords.longitude
  };
  localStorage.setItem("location", JSON.stringify(latlon))
  return latlon;
};

function getSunset(date, lat, lon) {
  const sunset = SunCalc.getTimes(date, lat, lon).sunset;
  return moment(sunset).format('LT');
}

async function main() {
  const container = document.querySelectorAll('.container')[0];
  print(`<h2>⏳ Getting location...</h2>`);
  const coords = await getCoords();
  container.replaceChildren();

  const today = moment();

  const title = $(`<h1 title='${JSON.stringify(coords)}'>Sunset ☀️ </h1>`);
  container.append(title);

  const refreshLocationLink = $('<a href="#" style="font-size: 0.4em;font-weight: 400; vertical-align: top;">refresh location</a>');
  refreshLocationLink.addEventListener('click', async () => {
    refreshLocationLink.textContent += ' ⏳'
    await getCoords(/*useCache = */false);
    location.reload();
  });
  title.append(refreshLocationLink);

  [
    [today, 'Today'],
    [moment(today).add(7, 'days'), 'Next week'],
    [moment(today).add(14, 'days'), 'In two weeks'],
    [,'<hr/>'],
    [moment(today).add(1, 'month'), 'In a month'],
    [moment(today).add(2, 'month'), 'In two months'],
    [moment(today).add(3, 'month'), 'In three months'],
    [moment(today).add(4, 'month'), 'In four months'],
    [moment(today).add(5, 'month'), 'In five months'],
    [,'<hr/>'],
    [calculateClosestSolstice(today), 'On closest solstice'],
    [calculateClosestSolstice(calculateClosestSolstice(today)), 'On next solstice']
  ].forEach(([date, description]) => {
    const text = date ? `<h2>${description} (${date.format('MM/DD')}): ${getSunset(date, coords.lat, coords.lon)}</h2>` : description;
    print(text);
  });

  function print(html) {
    container.insertAdjacentHTML('beforeend', html);
  }

}

function calculateClosestSolstice(today) {
  const summer = moment(today).month(5).date(21);

  if (summer > today) return summer;
  
  const winter = moment(today).month(11).date(21);

  if (winter > today) return winter;

  return summer.add(1, 'year'); // summer next year
}

// from https://youmightnotneedjquery.com/#create_elements
function $(html, onlyFirst = true) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  const children = template.content.children;
  return onlyFirst ? children[0] : children;
}

/*
const range = (max) => [...Array(max).keys()];

const findClosestDate = (sunsetTimeToFind, lat, lon) => {
    const NOW = moment();
    const DAYS = range(365).map((n) => NOW.clone().add(n, 'days'));
    console.log({DAYS})
    const SUNSETS = DAYS.map((date) => {
        return {
            sunset: getSunset(date, lat, lon),
            date: date
        }
    }).sort((a, b) => a.sunset.localeCompare(b.sunset));


    const datesWithSameSunset = SUNSETS.filter((x) => x.sunset == sunsetTimeToFind)

    console.log({SUNSETS})
    console.log({ByDate: 
      SUNSETS.sort((a, b) => a.date.format().localeCompare(b.date.format())).map((x) => ({sunset: x.sunset, dateString: x.date.format()}))
    })

    console.log(datesWithSameSunset.map(x => x.date.format()));
}
*/

main().then();