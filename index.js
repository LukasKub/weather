
// first load only
if (new URLSearchParams(window.location.search).get("city") === null) { // empty url parameter city
    window.history.pushState(" ", " ", "/wheater?city=Prague");
    weatherFn("Prague");
} else {
    weatherFn(new URLSearchParams(window.location.search).get("city"));
}

// main function for an HTTP request and data settings
async function weatherFn(cityName) {

    const url = 'https://api.openweathermap.org/data/2.5/weather';
    const apiKey = 'f00c38e0279b7bc85480c3fe775d518c';

    const temp = `${url}?q=${cityName}&appid=${apiKey}&units=metric`;
    try {
        const res = await fetch(temp); // fetch API
        const data = await res.json(); // response to the HTTP request for current day
        if (res.ok) {
            $('#city').text(data.name + " (" + data.sys.country + ")");
            $('#temperature').text(`${data.main.temp.toFixed(1)}°C`);
            $('#description').text(data.weather[0].description);

            $('#feel').text(`${data.main.feels_like.toFixed(0)}°C`);
            $('#pressure').text(`${data.main.pressure} hPa`);
            $('#humidity').text(`${data.main.humidity}%`);
            $('#cloudiness').html(`${data.clouds.all}%`);
            $('#wind-speed').html(`${data.wind.speed} m/s`);


            if (!$("#btnCZ").attr("class").includes("text-secondary")) { // CZ date
                const today = new Date();
                let time = new Date(data.dt * 1000).toLocaleTimeString("cs-cz").substring(0, 5);
                if (time[4] === ":") {
                    time = time.substring(0, 4);
                }
                $('#todayDate').text(today.toLocaleDateString("cs-cz", {
                    "year": "numeric", "day": "numeric", "month": "long",
                }) + ", " + time);
            }

            const urlImg = "https://openweathermap.org/img/wn/" + data.weather[0].icon + ".png";
            $('#weather-icon').attr('src', urlImg);

            weatherShowFn();

            getDatafor5days(data.coord.lat, data.coord.lon, apiKey);

        } else {
            alert('Město nenalezeno');
        }

        window.history.pushState("", "", "/weather?city=" + cityName); // sets the city as a URL parameter
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }

}

function weatherShowFn() {

    $('#city-input-btn').on('click', function () {
        let cityName = $('#city-input').val();
        if (cityName) {
            weatherFn(cityName);
        } else {
            alert("Vložte název města");
        }
    });
}

function changeLanguage(type) {

    try {
        if (type === "EN") {
            $('#h2-title').text("Weather");
            $('#description').css('visibility', 'visible');

            $('#city-input-btn').text("Search");
            $("#city-input").attr("placeholder", "Enter your city");

            $('#h3-24hour').text("24 hour forecast");
            $('#h3-5day').text("5 day forecast");

            for (let day = 1; day < 7; day++) { // loop for days 1-6
                $('#feel-' + day).text("Feels like");
                $('#pressure-' + day).text("Pressure");
                $('#humidity-' + day).text("Humidity");
                $('#cloudiness-' + day).text("Cloudiness");
                $('#wind-speed-' + day).text("Wind");
                $("#btnEN").removeClass("text-secondary");
                $("#btnCZ").addClass("text-secondary");
            }

            const today = new Date()
            $('#todayDate').text(today.getDate() + ". " + new Date(today).toLocaleString('en-us', { month: 'long', year: 'numeric' })
                + ", " + today.getHours() + ":" + today.getMinutes());

            let otherDays = new Date(today)

            for (let index = 0; index < 5; index++) { // loop to set (long) US date for days 2–6
                otherDays.setDate(otherDays.getDate() + 1);
                let date = otherDays.toLocaleString('en-us', { weekday: 'long' });
                $('#date' + (2 + index)).text(date + " " + otherDays.getDate() + ".");
            }

        } else {
            window.location.href = window.location.href;
        }

    } catch {
        console.error('Error fetching 5 day weather:', error);
    }

}

async function getDatafor5days(lat, lon, apiKey) {

    const url = 'https://api.openweathermap.org/data/2.5/forecast?'; // 5 day forecast 
    const temp = `${url}&lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`; // metric -> °C
    try {
        let res = await fetch(temp);
        let data = await res.json(); // response for 5 days


        // data for 24 hours (3-hour periods)
        for (let i = 1; i < 9; i++) {
            $('#threeHour' + i).text(data.list[i].dt_txt.substring(11, 16));
            const urlImg = "https://openweathermap.org/img/wn/" + data.list[i].weather[0].icon + ".png";
            $('#threeHour-icon' + i).attr('src', urlImg);
            $('#threeHour-temp' + i).text(`${data.list[i].main.temp.toFixed(0)}°`);
            $('#threeHour-cloud' + i).html(`${data.list[i].clouds.all}%`);
            $('#threeHour-wind' + i).html(`${data.list[i].wind.speed.toFixed(1)} m/s`);
        }


        const setOtherDays = (day, dayOrder) => {
            let maxTemp = -100;
            let minTemp = 1000;
            let indexMax = -1;

            for (let i = 0; i < data.list.length; i++) {
                if (day == data.list[i].dt_txt.substring(8, 10)) {
                    if (maxTemp < data.list[i].main.temp) {
                        maxTemp = data.list[i].main.temp;
                        indexMax = i;
                    }
                    if (minTemp > data.list[i].main.temp)
                        minTemp = data.list[i].main.temp;
                }
            }

            if (indexMax != -1) {

                const urlImg = "https://openweathermap.org/img/wn/" + data.list[indexMax].weather[0].icon + ".png";

                if (!$("#btnCZ").attr("class").includes("text-secondary")) { // CZ date 5 day forcast
                    const date = otherDays.toLocaleString('cs-cz', { weekday: 'long' });
                    $('#date' + dayOrder).text(date + " " + otherDays.getDate() + ".");
                }

                $('#weather-icon' + dayOrder).attr('src', urlImg);
                $('#temperature' + dayOrder).text(`${maxTemp.toFixed(0)}°`);
                $('#temperature' + dayOrder + 'b').text(`${minTemp.toFixed(0)}°`);

                $('#feel' + dayOrder).text(`${data.list[indexMax].main.feels_like.toFixed(0)}°C`);
                $('#wind-speed' + dayOrder).html(`${data.list[indexMax].wind.speed.toFixed(1)} m/s`);
                $('#cloudiness' + dayOrder).html(`${data.list[indexMax].clouds.all}%`);
                $('#humidity' + dayOrder).text(`${data.list[indexMax].main.humidity}%`);
                $('#pressure' + dayOrder).text(`${data.list[indexMax].main.pressure} hPa`);
            } else {
                $('#latestDay').remove();
            }
        }

        const today = new Date()
        let otherDays = new Date(today)

        for (let index = 0; index < 5; index++) { // loop for days 2-6
            otherDays.setDate(otherDays.getDate() + 1);
            setOtherDays(otherDays.getDate(), (2 + index));
        }

    } catch (error) {
        console.log(error);
    }
};
