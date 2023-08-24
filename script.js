const cityInput = document.querySelector(".cityInput")
const searchButton = document.querySelector(".search")
const locationButton = document.querySelector(".location-btn")
const currentWeatherDiv = document.querySelector(".current-weather")
const weatherCardsDiv = document.querySelector(".weather-cards")
const themeChanger = document.querySelector("#themeToggler")


// API key
const api_id = 'YOUR API KEY'

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) { // HTML for main Card
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)} &deg;C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>

                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    } else { // HTML for the other five day forecast card
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                    <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)} &deg;C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </li>`;

    }


}


const getWeatherDetails = (cityName, lat, lon) => {
    const weather_api_url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_id}`

    fetch(weather_api_url).then(response => response.json()).then(data => {

        // Filter the forecasts to get only one forecast per day 
        const uniqueForecastDays = []
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate)
            }
        })

        console.log(fiveDaysForecast)

        // Clearing previous weather data
        cityInput.value = ""
        currentWeatherDiv.innerHTML = ""
        weatherCardsDiv.innerHTML = ""

        console.log(fiveDaysForecast)
        // Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index))
            }
            else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index))
            }


        })


    }).catch(() => {
        alert('An error occured while fetching the weather-forecast')
    })
}


const getCityCoordinates = () => {
    const cityName = cityInput.value.trim() // get user entered city name and remove the extra spaces
    if (!cityName) return; // Return if city name is empty
    const geocoding_api_url = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${api_id}`
    // console.log(geocoding_api_url)

    // Get entered city coordinates (latitude, longitude, name) from API response
    fetch(geocoding_api_url).then(response => response.json()).then(data => {
        if (!data.length) return alert(`No co-ordinates found for ${cityName}`);
        const { name, lat, lon } = data[0]
        getWeatherDetails(name, lat, lon)

    }).catch(() => {
        alert('An error occured while fetching the co-ordinates')
    })

}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords // Get coordinates of user location
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${api_id}`;

            // Get city name from coordinates using reverse geocoding API
            fetch(REVERSE_GEOCODING_URL).then(response => response.json()).then(data => {
                console.log(data);
                const { name } = data[0]
                getWeatherDetails(name, latitude, longitude)
            }).catch(() => {
                alert('An error occured while fetching the city')
            })
        },
        error => { // show alert if user denied the location permission
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant the access again.")
            }
        }
    );
}

const changeTheme = () => {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
        themeChanger.classList.remove("fa-sun");
        themeChanger.classList.add("fa-moon");
    } else {
        themeChanger.classList.remove("fa-moon");
        themeChanger.classList.add("fa-sun");
    }
}


locationButton.addEventListener("click", getUserCoordinates)
searchButton.addEventListener("click", getCityCoordinates)
themeChanger.addEventListener("click", changeTheme)
