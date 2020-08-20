// Introduce date variable & format it appropriately
let day = new Date();
let dd = String(day.getDate()).padStart(2, '0');
let mm = String(day.getMonth() + 1).padStart(2, '0');
let yyyy = day.getFullYear();
day = mm + '/' + dd + '/' + yyyy;

// create variables of jQuery objects
const currentForecast = $(`#currentForecast`);
const currentUV = $(`#currentUV`);
const futureWeather = $(`#weeklyForecast`);

// First ajax call on document load if localstorage is not empty
if(localStorage.length != 0 ){
    let searchedHist = JSON.parse(localStorage.getItem(`countries`));
    var currentCity = searchedHist[searchedHist.length - 1];
    const key = `9e9ad6a7207064d6a6e62b75b4ae4211`;
    const queryURL = `https://cors-anywhere.herokuapp.com/api.openweathermap.org/data/2.5/forecast?q=${currentCity}&appid=${key}`;

    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(response => {
        console.log(response);

        const lon = response.city.coord.lon;
        const lat = response.city.coord.lat;
        const queryURL2 = `https://cors-anywhere.herokuapp.com/api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${key}`

        $.ajax({
            
            url: queryURL2,
            method: "GET",  
        }).then(data =>{
            const kTemp = data.current.temp;
            const cTemp = Math.floor(kTemp - 273);

            const hum = data.current.humidity;

            const wind = data.current.wind_speed;
            const windKM = Math.floor((wind*1.609));

            const uvi = data.current.uvi;
            const uv = $('<p>');
            $(uv).text(uvi)

            // Set UV colour to indiciate severity
            if(uvi < 3){
                $(currentUV).attr(`class`, `lowUV`)
            }
            if(uvi > 3 && uvi < 7){
                $(currentUV).attr(`class`,`modUV`)
            }
            else{
                $(currentUV).attr(`class`,`highUV`)
            }
            // dynamically find weather icon source and set as icon variable
            const iconCode = data.current.weather[0].icon;
            const iconURL = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
            const icon = `<img src=${iconURL}>`;
        
            $(currentForecast).append(`<h1>${currentCity} ${icon} ${day}</h1>`);
            $(currentForecast).append(`<h3> Temperature: ${cTemp} °C </h3>`);
            $(currentForecast).append(`<h3> Humidity: ${hum}%`);
            $(currentForecast).append(`<h3> Wind Speed: ${windKM} KMPH`);
            $(currentUV).append(`<h3> UV Index: ${uvi}`);

            // call cardsCreate function passing through data from ajax call
            cardsCreate(data)
        })
        
    })
}

// Adds cities to localstorage
function addDestination(){
    const searchRes = document.getElementById(`destSearch`).value;
    const searchHistory = JSON.parse(localStorage.getItem(`countries`)) || [];

    searchHistory.push(searchRes);
    localStorage.setItem(`countries`, JSON.stringify(searchHistory));
}

// Pulls city list from localstorage array and passes data into function creating buttons
function populateDestinations(){
    const savedData = localStorage.getItem(`countries`);
    const destArray = JSON.parse(savedData);
    destArray.forEach(createList)  
}
populateDestinations()

// Adds destinations to HTML file as buttons
function createList(destination){
    const listItem = $(`<button>`);
    const resultsArea = $("#resultsArea");

    $(listItem).attr(`class`, `list-group-item list-group-item-action`);
    $(listItem).attr(`onclick`, `changeDest(event)`)
    listItem.append(destination);
    resultsArea.append(listItem); 
}

// Clears localstorage, added as eventlistener
function clearList(){
    localStorage.clear();
}

// Function for further ajax calls aside from initial page load
function queryAPI(currentCity){
    const key = `9e9ad6a7207064d6a6e62b75b4ae4211`;
    const queryURL = `https://cors-anywhere.herokuapp.com/api.openweathermap.org/data/2.5/forecast?q=${currentCity}&appid=${key}`;

    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(response => {
        console.log(response);

        const lon = response.city.coord.lon;
        const lat = response.city.coord.lat;
        const queryURL2 = `https://cors-anywhere.herokuapp.com/api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${key}`

        $.ajax({
            
            url: queryURL2,
            method: "GET",  
        }).then(data =>{
            const kTemp = data.current.temp;
            const cTemp = Math.floor(kTemp - 273);

            const hum = data.current.humidity;

            const wind = data.current.wind_speed;
            const windKM = Math.floor((wind*1.609));

            const uvi = data.current.uvi;
            const uv = $('<p>');
            console.log(uvi)
            $(uv).text(uvi)

            if(uvi < 3){
                $(currentUV).attr(`class`, `lowUV`)
            }
            if(uvi > 3 && uvi < 7){
                $(currentUV).attr(`class`,`modUV`)
            }
            else{
                $(currentUV).attr(`class`,`highUV`)
            }

            const iconCode = data.current.weather[0].icon;
            const iconURL = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
            const currentIcon = `<img src=${iconURL}>`;
            console.log(currentIcon)
        
            $(currentForecast).append(`<h1>${currentCity} ${currentIcon} ${day}</h1>`);
            $(currentForecast).append(`<h3> Temperature: ${cTemp} °C </h3>`);
            $(currentForecast).append(`<h3> Humidity: ${hum}%`);
            $(currentForecast).append(`<h3> Wind Speed: ${windKM} KMPH`);
            $(currentUV).append(`<h3> UV Index: ${uvi}`);
            
            // Create 5 day forecast with data from current API request
            cardsCreate(data)
        }) 
    })
}

// Clears html file of previous destination data before passing in new data
function changeDest(event){
    $(currentForecast).html("")
    $(currentUV).html("");
    const clearCards = document.getElementsByClassName(`futureCards`)
    $(clearCards).remove()
    var currentCity = event.target.innerHTML;
    queryAPI(currentCity);
}

// Adds 5 day forecast, data is passed through from a previous API request
function cardsCreate(data){
    for (i=1; i < 6; i++){

        let day = new Date();
        let dd = String(day.getDate()+ i).padStart(2, '0') ;
        let mm = String(day.getMonth() + 1).padStart(2, '0');
        let yyyy = day.getFullYear();
        day = mm + '/' + dd + '/' + yyyy;
        console.log(day)

        let futureIconCode = data.daily[i].weather[0].icon;
        let futureIconURL = `http://openweathermap.org/img/wn/${futureIconCode}@2x.png`;
        let futureIcon = `<img src=${futureIconURL}>`;

        console.log(futureIconURL)

        let futureK = data.daily[i].temp.max;
        let futureTemp = Math.floor(futureK - 273)
        let futureHum = data.daily[i].humidity;

        const futureCard = $(`<card>`);
        $(futureCard).attr(`class`, `card futureCards`);
        $(futureCard).append(`${day}<br>`);
        $(futureCard).append(`${futureIcon}<br>`);
        $(futureCard).append(`Temp: ${futureTemp} °C <br>`);
        $(futureCard).append(`Humidity: ${futureHum}%`);
        $(`#weeklyForecast`).before(futureCard);
        
    }
}