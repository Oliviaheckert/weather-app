async function fetchWeather() {
    let searchInput = document.getElementById("search").value;
    const weatherDataSection = document.getElementById("weather-data");
    weatherDataSection.style.display = 'block';

    if (searchInput.trim() === "") {
        weatherDataSection.innerHTML = `
        <div>
            <h2>Empty Input!</h2>
            <p>Please try again with a valid <u>city name</u>.</p>
        </div>
        `;
        return;
    }

    async function getLonAndLat() {
        try {
            const response = await fetch(`/api/geocode?city=${encodeURIComponent(searchInput)}`);
            
            if (!response.ok) {
                throw new Error('Geocoding API error');
            }

            const data = await response.json();

            if (data.length === 0) {
                throw new Error("City not found");
            }

            return data[0];
        } catch (error) {
            weatherDataSection.innerHTML = `
            <div>
                <h2>Location Error</h2>
                <p>${error.message}. Please check the city name.</p>
            </div>
            `;
            throw error;
        }
    }

async function getWeatherData(lon, lat) {
    try {
        const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
            
        if (!response.ok) {
            throw new Error('Weather API error');
        }

        const data = await response.json();
            
        weatherDataSection.style.display = "flex";
        weatherDataSection.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" 
             alt="${data.weather[0].description}" 
             width="150"                  
             title="${data.weather[0].main}" />
        <div>
            <h2>${data.name}, ${data.sys.country}</h2>
            <p><strong>Temperature:</strong> ${Math.round(data.main.temp)}°C</p>
            <p><strong>Feels Like:</strong> ${Math.round(data.main.feels_like)}°C</p>
            <p><strong>Description:</strong> ${data.weather[0].description}</p>
        <div class="additional-info">
                <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
                <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
            </div>
        </div>
        `;
    } catch (error) {
        weatherDataSection.innerHTML = `
        <div>
            <h2>Weather Data Error</h2>
            <p>${error.message}. Please try again.</p>
        </div>
        `;
        throw error;
    }    
}

    try {
        const geocodeData = await getLonAndLat();
        await getWeatherData(geocodeData.lon, geocodeData.lat);
    } catch (error) {
        console.error("Fetch Weather Error:", error);
    } finally {
        document.getElementById("search").value = "";
    }
}