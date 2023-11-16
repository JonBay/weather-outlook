var searchForm = document.querySelector("#search-form");
var APIKeyOpenWeather = "0ba3133cb694a7de240bc9e5f4fceed2";
var searchResultsContainer = document.getElementById("api-results");
var searchInput = document.querySelector("#search-input");
var searchHistoryContainer = document.getElementById("search-history");

// Load search history from local storage and render buttons
loadSearchHistory();

searchForm.addEventListener("submit", function (event) {
  event.preventDefault();
  var userInput = searchInput.value;
  if (userInput) {
    console.log("Submitting search form:", userInput);
    addToLocalStorage(userInput);
    getCity(userInput);
  } else {
    console.error("You need a search input value!");
  }
});

// Add event listener for Enter key
document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    var userInput = searchInput.value;
    if (userInput) {
      console.log("Submitting search form (Enter key):", userInput);
      addToLocalStorage(userInput);
      getCity(userInput);
    } else {
      console.error("You need a search input value!");
    }
  }
});

function addToLocalStorage(value) {
  // Get existing search history from local storage
  var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

  // Add new value to search history
  searchHistory.push(value);

  // Save updated search history to local storage
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));

  // Render updated search history buttons
  loadSearchHistory();
}

function loadSearchHistory() {
  // Clear existing buttons
  searchHistoryContainer.innerHTML = "";

  // Get search history from local storage
  var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

  // Render buttons for each search history item
  searchHistory.forEach(function (item) {
    var button = document.createElement("button");
    button.textContent = item;
    button.addEventListener("click", function () {
      getCity(item);
    });
    searchHistoryContainer.appendChild(button);

    // Add margin to create space between buttons
    button.style.marginTop = "30px";
  });
}

function getCity(userInput) {
  var requestUrl =
    "https://api.openweathermap.org/geo/1.0/direct?q=" +
    userInput +
    ",US&limit=1&appid=" +
    APIKeyOpenWeather;

  fetch(requestUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.length > 0) {
        var cityLatitude = data[0].lat;
        var cityLongitude = data[0].lon;
        var cityName = data[0].name;

        getCurrentWeather(cityName, cityLatitude, cityLongitude);
        getWeatherForecast(cityLatitude, cityLongitude);
      } else {
        console.error("No matching city found");
      }
    })
    .catch(function (error) {
      console.error("Error fetching data:", error);
    });
}

function getCurrentWeather(cityName, cityLatitude, cityLongitude) {
  var forecastRequestURL =
    "https://api.openweathermap.org/data/2.5/weather?lat=" +
    cityLatitude +
    "&lon=" +
    cityLongitude +
    "&appid=" +
    APIKeyOpenWeather +
    "&units=imperial";

  fetch(forecastRequestURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log("Current Weather API Response:", data);

      var currentDate = new Date().toLocaleDateString();
      var icon = data.weather[0].icon;
      var temp = data.main.temp;
      var wind = data.wind.speed;
      var humidity = data.main.humidity;
      console.log(cityName + currentDate + icon + temp + wind + humidity);
      displayCurrentWeather(cityName, currentDate, icon, temp, wind, humidity);
    })
    .catch(function (error) {
      console.error("Error fetching current weather:", error);
    });
}

function getWeatherForecast(cityLatitude, cityLongitude) {
  var forecastRequestURL =
    "https://api.openweathermap.org/data/2.5/forecast?lat=" +
    cityLatitude +
    "&lon=" +
    cityLongitude +
    "&appid=" +
    APIKeyOpenWeather +
    "&units=imperial";

  fetch(forecastRequestURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log("Weather Forecast API Response:", data);

      // Extract daily forecasts
      var dailyForecasts = extractDailyForecasts(data.list);

      console.log(dailyForecasts);

      displayForecast(dailyForecasts);
    })
    .catch(function (error) {
      console.error("Error fetching weather forecast:", error);
    });
}

function extractDailyForecasts(forecastList) {
  // Group forecasts by day
  var groupedByDay = forecastList.reduce(function (acc, forecast) {
    var date = forecast.dt_txt.split(" ")[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(forecast);
    return acc;
  }, {});

  // Take the first forecast of each day
  var dailyForecasts = Object.values(groupedByDay).map(
    function (dailyForecast) {
      return dailyForecast[0];
    }
  );

  return dailyForecasts;
}

function displayCurrentWeather(
  cityName,
  currentDate,
  icon,
  temp,
  wind,
  humidity
) {
  // Create HTML elements to display current weather
  var currentWeatherContainer = document.createElement("div");
  currentWeatherContainer.classList.add("current-weather");

  var cityElement = document.createElement("h2");
  cityElement.textContent = cityName;

  var dateElement = document.createElement("p");
  dateElement.textContent = "Date: " + currentDate;

  var iconElement = document.createElement("img");
  iconElement.src = "http://openweathermap.org/img/wn/" + icon + ".png";
  iconElement.alt = "Weather Icon";

  var tempElement = document.createElement("p");
  tempElement.textContent = "Temperature: " + temp + " °F";

  var windElement = document.createElement("p");
  windElement.textContent = "Wind: " + wind + " mph";

  var humidityElement = document.createElement("p");
  humidityElement.textContent = "Humidity: " + humidity + "%";

  // Append elements to the container
  currentWeatherContainer.appendChild(cityElement);
  currentWeatherContainer.appendChild(dateElement);
  currentWeatherContainer.appendChild(iconElement);
  currentWeatherContainer.appendChild(tempElement);
  currentWeatherContainer.appendChild(windElement);
  currentWeatherContainer.appendChild(humidityElement);

  var existingWeatherContainer = document.getElementById(
    "This is the current weather"
  );

  existingWeatherContainer.innerHTML = "";
  existingWeatherContainer.appendChild(currentWeatherContainer);
}

function displayForecast(forecastData) {
  // Create HTML elements to display 5-day forecast
  var forecastContainer = document.createElement("div");
  forecastContainer.classList.add("forecast-container");

  for (var i = 0; i < forecastData.length; i++) {
    if (i === 5) {
      break;
    }

    var forecastItem = forecastData[i];

    var dateElement = document.createElement("p");
    dateElement.textContent = "Date: " + forecastItem.dt_txt;

    var iconElement = document.createElement("img");
    iconElement.src =
      "http://openweathermap.org/img/wn/" +
      forecastItem.weather[0].icon +
      ".png";
    iconElement.alt = "Weather Icon";

    var tempElement = document.createElement("p");
    tempElement.textContent = "Temperature: " + forecastItem.main.temp + " °F";

    var windElement = document.createElement("p");
    windElement.textContent = "Wind: " + forecastItem.wind.speed + " MPH";

    var humidityElement = document.createElement("p");
    humidityElement.textContent =
      "Humidity: " + forecastItem.main.humidity + "%";

    var forecastItemContainer = document.createElement("div");
    forecastItemContainer.classList.add("forecast-item");
    forecastItemContainer.appendChild(dateElement);
    forecastItemContainer.appendChild(iconElement);
    forecastItemContainer.appendChild(tempElement);
    forecastItemContainer.appendChild(windElement);
    forecastItemContainer.appendChild(humidityElement);

    forecastContainer.appendChild(forecastItemContainer);
  }

  var apiResultsElement = document.getElementById("api-results");

  apiResultsElement.innerHTML = "";

  apiResultsElement.appendChild(forecastContainer);
}
