
// first load only
function checkParams() {

    if (new URLSearchParams(window.location.search).get("city") === null) { // empty url parameter city 
        weatherFn("Prague");
    } else {
        weatherFn(new URLSearchParams(window.location.search).get("city"));
    }
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

            $('#temperature').text(data.main.temp.toFixed(1));

            $('#description').text(data.weather[0].description);

            $('#wind-speed').html((data.wind.speed * 3.6).toFixed(0));

            degToCompass(data.wind.deg, -1);

            $('#humidity').text(`${data.main.humidity}%`);
            $('#pressure').text(data.main.pressure);

            const urlImg = "https://openweathermap.org/img/wn/" + data.weather[0].icon + ".png";
            $('#weather-icon').attr('src', urlImg);

            getDatafor5days(data.coord.lat, data.coord.lon, apiKey);

            const today = new Date();

            let time = new Date(data.dt * 1000).toLocaleTimeString("cs-cz"); // CZ date
            time = time.substring(0, (time.length - 3))

            if ($("#title").text() === "Počasí") {
                $('#todayDate').text(today.toLocaleDateString("cs-cz", {
                    weekday: 'long',
                }) + " " + time);

                $('#description').text(translateDescription(data.weather[0].icon));

            } else { // EN
                if (time.length < 5) {
                    time = "0" + time;
                }
                $('#todayDate').text(new Date(today).toLocaleString('en-us', { weekday: 'long' })
                    + " " + timeConvert(time));
                $('#description').text(data.weather[0].description);
            }

            for (let i = 0; i < 8; i++) { // decolorize wind
                document.getElementById("threeHour-wind" + (i + 1)).style.color = "lightgray";
            }
            for (let i = 2; i < 7; i++) {
                document.getElementById("wind-speed" + i).style.color = "lightgray";
            }
            document.getElementById("wind-speed").style.color = "lightgray";

        } else {
            alert('Město nenalezeno');
        }

        $('#city-input').prop("value", cityName);

        window.history.pushState("", "", "/weather?city=" + cityName); // sets the city as a URL parameter

    } catch (error) {
        console.error('Error fetching weather data:', error);
    }

}

function translateDescription(icon) {
    let description;

    switch (icon) {
        case "01d": // day
        case "01n": // night
            description = "jasno";
            break;
        case "02d":
        case "02n":
            description = "polojasno";
            break;
        case "03d":
        case "03n":
            description = "oblačno";
            break;
        case "04d":
        case "04n":
            description = "zataženo";
            break;
        case "09d":
        case "09n":
            description = "přeháňky";
            break;
        case "10d":
        case "10n":
            description = "déšť";
            break;
        case "11d":
        case "11n":
            description = "bouřka";
            break;
        case "13d":
        case "13n":
            description = "sněžení";
            break;
        case "50d":
        case "50n":
            description = "mlha";
            break;
        default:
    }
    return description;
}

function timeConvert(time24) {
    var ts = time24;
    var H = +ts.substr(0, 2);
    var h = (H % 12) || 12;
    h = (h < 10) ? ("0" + h) : h;
    var ampm = H < 12 ? " AM" : " PM";
    ts = h + ts.substr(2, 3) + ampm;
    return ts;
};

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
            $('#title').text("Weather");

            $('#city-input-btn').text("Search");
            $("#city-input").attr("placeholder", "Enter your city");
            $('#theadActual').text("Current conditions");

            $('#h3-24hour').text("24 hour forecast");
            $('#h3-5day').text("5 day forecast");

            for (let i = 1; i < 4; i++) {
                $('#pressure-text' + i).text("Pressure");
                $('#humidity-text' + i).text("Humidity");
                $('#wind-text' + i).text("Wind");
                $('#rainfall-text' + i).text("Rainfall");
            }

            $("#btnEN").css('color', 'white');
            $("#btnCZ").css('color', 'lightgray');

            document.title = "Weather";

            const today = new Date();
            let otherDays = new Date(today)

            for (let index = 0; index < 5; index++) { // set (long) US date for days 2–6
                otherDays.setDate(otherDays.getDate() + 1);
                let date = otherDays.toLocaleString('en-us', { weekday: 'long' });
                $('#date' + (2 + index)).text(date + " " + otherDays.getDate() + ".");
            }

            if (new URLSearchParams(window.location.search).get("city") !== null) { // empty url parameter city 
                weatherFn(new URLSearchParams(window.location.search).get("city"), "EN");
            } else {
                weatherFn("Praha", "EN");
            }

        } else {
            window.location.href = window.location.href;
        }

    } catch {
        console.error('Error fetching 5 day weather:', error);
    }

}

function degToCompass(num, index) {

    var val = Math.floor((num / 22.5) + 0.5);
    var arr = ["down", "down-left", "down-left", "down-left", "left", "up-left", "up-left", "up-left", "up", "up-right",
        "up-right", "up-right", "right", "down-right", "down-right", "down-right"];
    if (index === -1) { // actual
        $("#wind-compass").removeClass();
        $("#wind-compass").addClass("text-info text-opacity-50 ms-1 fs-6 bi bi-arrow-" + arr[(val % 16)]);
    } else { // 24 hour
        $("#threeHour-wind-compass-" + index).removeClass();
        $("#threeHour-wind-compass-" + index).addClass("text-info text-opacity-50 fs-6 bi bi-arrow-" + arr[(val % 16)]);
    }
}

async function getDatafor5days(lat, lon, apiKey) {

    const url = 'https://api.openweathermap.org/data/2.5/forecast?'; // 5 day forecast 
    const temp = `${url}&lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`; // metric -> °C
    try {
        let res = await fetch(temp);
        let data = await res.json(); // response for 5 days


        // data for 24 hours (3-hour periods)
        for (let i = 0; i < 8; i++) {

            if ($("#title").text() === "Počasí") {
                $('#threeHour' + (i + 1)).text(data.list[i].dt_txt.substring(11, 16));
            } else {
                $('#threeHour' + (i + 1)).text(timeConvert(data.list[i].dt_txt.substring(11, 16)));
            }

            const urlImg = "https://openweathermap.org/img/wn/" + data.list[i].weather[0].icon + ".png";
            $('#threeHour-icon' + (i + 1)).attr('src', urlImg);

            if ($("#title").text() === "Počasí") {
                $('#threeHour-description' + (i + 1)).text(translateDescription(data.list[i].weather[0].icon));
            } else {
                $('#threeHour-description' + (i + 1)).html(`${data.list[i].weather[0].description}`);
            }

            $('#threeHour-wind' + (i + 1)).html(`${(data.list[i].wind.speed * 3.6).toFixed(0)} km/h`);

            degToCompass(data.list[i].wind.deg, (i + 1));
        }

        const setOtherDays = (day, dayOrder) => {
            let maxTemp = -100;
            let minTemp = 100;
            let idxMaxTemp = -1;

            let avgWind = 0, avgRainfall = 0, avgHumidity = 0, avgPressure = 0;
            let periodCounter = 0;

            // calculation of averages and maximum and minimum values for individual days
            for (let i = 0; i < data.list.length; i++) {
                if (day == data.list[i].dt_txt.substring(8, 10)) {
                    if (maxTemp < data.list[i].main.temp) {
                        maxTemp = data.list[i].main.temp;
                        idxMaxTemp = i;
                    }
                    if (minTemp > data.list[i].main.temp) {
                        minTemp = data.list[i].main.temp;
                    }
                    avgRainfall = avgRainfall + data.list[i].pop;
                    avgWind = avgWind + data.list[i].wind.speed;
                    avgHumidity = avgHumidity + data.list[i].main.humidity;
                    avgPressure = avgPressure + data.list[i].main.pressure;
                    periodCounter++;
                }
            }
            avgRainfall = avgRainfall / periodCounter;
            avgWind = avgWind / periodCounter;
            avgHumidity = avgHumidity / periodCounter;
            avgPressure = avgPressure / periodCounter;

            let windTemp = (avgWind * 3.6).toFixed(0);
            if (windTemp > 39 && windTemp < 75) { // strong wind (Beaufort scale)
                document.getElementById("wind-speed" + dayOrder).style.color = "#FFD580";
            } else if (windTemp >= 75) { // windstorm (Beaufort scale)
                document.getElementById("wind-speed" + dayOrder).style.color = "#FF7276";
            }

            if (idxMaxTemp != -1) {

                const urlImg = "https://openweathermap.org/img/wn/" + data.list[idxMaxTemp].weather[0].icon + ".png";

                if ($("#title").text() === "Počasí") {
                    const date = otherDays.toLocaleString('cs-cz', { weekday: 'long' }); // CZ date
                    $('#date' + dayOrder).text(date + " " + otherDays.getDate() + ".");

                    $('#description' + dayOrder).text(translateDescription(data.list[idxMaxTemp].weather[0].icon));
                } else {
                    $('#description' + dayOrder).html(`${data.list[idxMaxTemp].weather[0].description}`);
                }

                $('#weather-icon' + dayOrder).attr('src', urlImg);

                if (maxTemp.toFixed(0) === "-0") { // fix -0
                    $('#temperature' + dayOrder).text("0°");
                } else {
                    $('#temperature' + dayOrder).text(`${maxTemp.toFixed(0)}°`);
                }

                $('#temperature' + dayOrder + 'b').text(`${minTemp.toFixed(0)}°`);

                $('#rainfall' + dayOrder).html(`${(avgRainfall * 100).toFixed(0)}%`);
                $('#wind-speed' + dayOrder).html(`${(avgWind * 3.6).toFixed(0)} km/h`);
                $('#humidity' + dayOrder).text(`${avgHumidity.toFixed(0)}%`);
                $('#pressure' + dayOrder).text(`${avgPressure.toFixed(0)} hPa`);

            } else { // data for the last day are not available yet
                $('#date6').remove();
                for (let i = 2; i < 8; i++) {
                    $('#latestDayRow' + i).remove();
                }
            }
        }

        const today = new Date()
        let otherDays = new Date(today)

        for (let index = 0; index < 5; index++) { // loop for days 2-6 (5 day forcast)
            otherDays.setDate(otherDays.getDate() + 1);
            setOtherDays(otherDays.getDate(), (2 + index));
        }

        createGraph(data, "Temperature");
        createGraph(data, "Rainfall");

        for (let i = 0; i < 8; i++) {
            let windTemp = (data.list[i].wind.speed * 3.6).toFixed(0)
            if (windTemp >= 39 && windTemp < 75) { // strong wind
                document.getElementById("threeHour-wind" + (i + 1)).style.color = "#FFD580";
            } else if (windTemp >= 75) { // windstorm
                document.getElementById("threeHour-wind" + (i + 1)).style.color = "#FF7276";
            }
        }

        animateValue()

    } catch (error) {
        console.log(error);
    }
};

function setColor(chart, type) {

    for (var i = 0; i < chart.options.data.length; i++) {
        dataSeries = chart.options.data[i];
        for (var j = 0; j < dataSeries.dataPoints.length; j++) {
            let actY = dataSeries.dataPoints[j].y;
            if (type === "Rainfall") {
                if (actY >= 75) {
                    dataSeries.dataPoints[j].color = "#107dac"; // high probability
                } else if (actY >= 50) {
                    dataSeries.dataPoints[j].color = "#1ebbd7";
                } else {
                    dataSeries.dataPoints[j].color = "#71c7ec";
                }
            } else if (type === "Temperature") { // only for points
                //
            }
        }
    }
}


function createGraph(data, type) {

    let graphType, addition, labelSize;
    let graphColor = "white";
    var dataModel;

    if (type === "Temperature") {
        dataModel = [
            { x: 10, y: Number(data.list[0].main.temp.toFixed(0)) },
            { x: 20, y: Number(data.list[1].main.temp.toFixed(0)) },
            { x: 30, y: Number(data.list[2].main.temp.toFixed(0)) },
            { x: 40, y: Number(data.list[3].main.temp.toFixed(0)) },
            { x: 50, y: Number(data.list[4].main.temp.toFixed(0)) },
            { x: 60, y: Number(data.list[5].main.temp.toFixed(0)) },
            { x: 70, y: Number(data.list[6].main.temp.toFixed(0)) },
            { x: 80, y: Number(data.list[7].main.temp.toFixed(0)) },];
        graphType = "splineArea";
        addition = "°";
        labelSize = 18;

        let min24hour = 100;
        for (let i = 0; i < 8; i++) {
            if (min24hour > data.list[i].main.temp) {
                min24hour = data.list[i].main.temp;
            }
        }

        if (min24hour >= 20) {
            graphColor = "#FF4400"; // 1000 K
        } else if (min24hour >= 10) {
            graphColor = "#FF890E"; // 2000 K
        } else if (min24hour >= 0) {
            graphColor = "#FFB16E"; // 3000 K
        } else if (min24hour >= -10) {
            graphColor = "#CADAFF"; // 10000 K
        } else {
            graphColor = "#98BAFF"; // 40000 K
        }

    } else if (type === "Rainfall") {
        dataModel = [
            { x: 10, y: Number((data.list[0].pop * 100).toFixed(0)) },
            { x: 20, y: Number((data.list[1].pop * 100).toFixed(0)) },
            { x: 30, y: Number((data.list[2].pop * 100).toFixed(0)) },
            { x: 40, y: Number((data.list[3].pop * 100).toFixed(0)) },
            { x: 50, y: Number((data.list[4].pop * 100).toFixed(0)) },
            { x: 60, y: Number((data.list[5].pop * 100).toFixed(0)) },
            { x: 70, y: Number((data.list[6].pop * 100).toFixed(0)) },
            { x: 80, y: Number((data.list[7].pop * 100).toFixed(0)) },];
        graphType = "column";
        addition = "%";
        labelSize = 16;

    } else {
        //
    }

    var chart = new CanvasJS.Chart("chart" + type, {

        interactivityEnabled: false,
        animationEnabled: true,
        dataPointMaxWidth: 40,
        axisX: {
            gridThickness: 0,
            tickLength: 0,
            lineThickness: 0,
            labelFormatter: function () {
                return " ";
            }
        },
        axisY: {
            gridThickness: 0,
            tickLength: 0,
            lineThickness: 0,
            labelFormatter: function () {
                return " ";
            }
        },
        backgroundColor: "transparent",
        data: [{
            type: graphType,
            fillOpacity: 0.5,
            color: graphColor,
            indexLabelFontColor: "white",
            indexLabelFontSize: labelSize,
            indexLabelFormatter: formatter,
            dataPoints: dataModel
        }]
    });

    setColor(chart, type);

    chart.render();

    function formatter(e) {
        return e.dataPoint.y + addition;
    }

}

$(document).on("keypress", function (e) {
    if (e.which == 13) {
        weatherFn($('#city-input').val());
    }
});

function animateValue() {

    $('.counter').each(function () {
        $(this).prop('Counter', 0).animate({
            Counter: $(this).text()
        }, {
            duration: 1000,
            easing: 'swing',
            step: function (now) {
                $(this).text(Math.ceil(now));
            }
        });
    });

    setTimeout(function () {
        const windTemp = $("#wind-speed").text()
        if (windTemp >= 39 && windTemp < 75) { 
            document.getElementById("wind-speed").style.color = "#FFD580";
        } else if (windTemp >= 75) { 
            document.getElementById("wind-speed").style.color = "#FF7276";
        }
    }, 1000)
}
