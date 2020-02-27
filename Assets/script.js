//setting globals
var userCity;
var cityName = [];

var storedCity = JSON.parse(localStorage.getItem("cityName"));

if (storedCity !== null) {
    cityName = storedCity;
}
//displays history 
displayLocalStorage();

function sendToLocalStorage(compareCity) {
    //catches no input
    if (compareCity === null || compareCity === "") {
        return;
    }
    for (var i = 0; i < cityName.length; i++) {
        if (cityName[i] === compareCity) {
            return;
        }
    }
    cityName.push(compareCity);
    localStorage.setItem("cityName", JSON.stringify(cityName));
}
function displayLocalStorage() {
    for (var i = 0; i < cityName.length; i++) {
        var displayCity = $("<li>").attr("class", "list-group-item storageCityClick").text(cityName[i]);
        $("#searchCard").append(displayCity);
    }
}

function setCurrentDay(weather) {
    //clears input each search
    $("#mainCard").empty();
    $("#searchCard").empty();
    //updates storage 
    sendToLocalStorage(userCity);

    var newLi = $("<li>").attr("class", "list-group-item");
    var newCity = $("<p>");
    var newTemp = $("<p>");
    var newHumidity = $("<p>");
    var newWind = $("<p>");
    
    newCity.text(weather.name + " " + moment().format("MMM Do YYYY")).append("<img id=fiveDay Icon src=https://openweathermap.org/img/wn/" + weather.weather[0].icon + "@2x.png>");
    newTemp.text("Temperature: " + ((weather.main.temp * 9/5) - 459.67).toFixed(2) + "°F");
    newHumidity.text("Humidity: " + weather.main.humidity + "%");
    newWind.text("Wind Speed " + weather.wind.speed + "MPH");
    newLi.append(newCity, newTemp, newHumidity, newWind);
    //need a seperate api to display UV index
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/uvi?appid=0c2a6e113a8152cfb400899caf93b5b1&lat=" + weather.coord.lat + "&lon=" + weather.coord.lon,
        method: "GET"
    }).then(function(UV) {
        var newUV = $("<p>");
        //creating a span to wrap the uv value. Thus allows me to change the background color based on the value via an if/else block
        var UVColor = $("<span>");
        if (UV.value > 0 && UV.value <= 2) {
            UVColor.text(UV.value).css("background-color", "#7bff7f");
        } else if (UV.value > 2 && UV.value <= 5) {
            UVColor.text(UV.value).css("background-color", "#fdff85");
        } else if (UV.value > 5 && UV.value <= 7) {
            UVColor.text(UV.value).css("background-color", "#ffc57d");
        } else if (UV.value > 7 && UV.value < 10) {
            UVColor.text(UV.value).css("background-color", "#fc5a5a");
        } else {
            UVColor.text(UV.value).css("background-color", "#c486dd");
        }
        newUV.text("UV Index: ");
        newUV.append(UVColor);
        newLi.append(newUV);
    });
    $("#mainCard").append(newLi);
    //continously displays history w/o refreshing page
    displayLocalStorage();
}

//seperate function for displaying the five day forecast
function setFiveDay(five) {
    $(".card-group").empty();
    var fiveDayArray = five.list;
    //the array gives 40 values (each day give 8 different times throughout the day). This loop catches the next day (i = 7) and should display a new day each iteration
    for (var i = 7; i <= fiveDayArray.length; i+=7) {
        var newCard = $("<div>").attr("class", "card");
        var newULCard = $("<ul>").attr("class", "list-group");
        var fiveDayLi = $("<li>").attr("class", "list-group-item");
        
        var fiveDate = $("<p>").attr("class", "card-text");
        var fiveTemp = $("<p>").attr("class", "card-text");
        var fiveHumidity = $("<p>").attr("class", "card-text");
        var fiveIcon = $("<p>").attr("class", "card-text");
        fiveDate.text(fiveDayArray[i].dt_txt);
        //open weather has built-in icons - I can capture the icon value via ajax
        fiveIcon.append("<img id=fiveDay Icon src=https://openweathermap.org/img/wn/" + fiveDayArray[i].weather[0].icon + "@2x.png>");
        fiveTemp.text("Temp: " + ((fiveDayArray[i].main.temp * 9/5) - 459.67).toFixed(2) + "°F");
        fiveHumidity.text("Humidity: " + fiveDayArray[i].main.humidity + "%");
        
        fiveDayLi.append(fiveDate, fiveIcon, fiveTemp, fiveHumidity);
        newULCard.append(fiveDayLi);
        newCard.append(newULCard);
        $(".card-group").append(newCard);
        //no need to call the display function
    }
}

function setApiURL(event) {
    event.preventDefault();
    //checks if history tab was clicked or if the search bar was used
    if (event.data.parameterButton === "button") {
        userCity = $("#city-input").val();
    }
    if (event.data.parameterLabel === "label") {
        userCity = $(this).text();
    }
    var currentDayURL = "https://api.openweathermap.org/data/2.5/weather?q=" + userCity + "&APPID=0c2a6e113a8152cfb400899caf93b5b1";
    var fiveDayURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + userCity + "&APPID=0c2a6e113a8152cfb400899caf93b5b1";
   
    //each ajax call has the unique url that cooresponds to the function call (current day or five day forecast)
    $.ajax({
        url: currentDayURL,
        method: "GET"
    }).then(setCurrentDay);
    
    $.ajax({
        url: fiveDayURL,
        method: "GET"
    }).then(setFiveDay);
}
//event handler for search bar
$("button").on("click", {parameterButton: "button"}, setApiURL);
//event hadler for history tab
$("#searchCard").on("click", "li.storageCityClick", {parameterLabel: "label"}, setApiURL);

