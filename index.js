
const TO_SECONDS = 1000;
let currentLang = 'EN';
const FORECAST_COUNT = 3;
const unspalshAccessKey = '92cc2d3a05679a6430d41064c9193c32cb35af4f36073bb267bff6b74d9812ed';
const ipinfoAccessKey = 'd86d127b14a84a';
const darkskyAccessKey = '68b4a1bec01fcfb5f3dde5906466af91';
const mapboxAccessKey = 'pk.eyJ1IjoicHJpbWFwc2EiLCJhIjoiY2s0NGszOXA5MGkxMTNtb2l2Nnh5eDB0byJ9.9wD8kOmEb_9tM2tW_FZlWA';
const opencagedataAccessKey = 'f4f5fd6c8b57420bb70c319b11fbc484';
let temperatureSign = '°';
let windSpeedSi = 'm/s';
let feelsLike = 'feels like';
let windTitle = 'wind';
let humidityTitle = 'humidity';
const defaultImage = 'assets/background.png';
let pageData = {};
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const ipinfoRequestUrl = `https://ipinfo.io/json?token=${ipinfoAccessKey}`;


 function getDefaultImage() {

     return defaultImage;
 } 

 async function getDataFromUrl(url){
    const response = await fetch(url);
    const urlData = await response.json();
    return urlData;
}
 async function setElementBackground(imgUrl) {     
      
      let source = await imgUrl;  
      if(!source) {          
          source = getDefaultImage();
      }
      body.style.backgroundImage = `url("${source}")`;       
        
  } 

async function getRemoteImage(params) { 
    const unsplashRequestUrl =  `https://api.unsplash.com/photos/random?query=${params}&client_id=${unspalshAccessKey}`;   
    const imgData = await getDataFromUrl(unsplashRequestUrl);      
    return imgData.urls.regular;
  }

function getCountryName(countryIso){
          
    return namesISO[countryIso] || false;    
}

 async function getLocation(url) {    
    
    const locationData = await getDataFromUrl(url);
    return locationData;  
   
  }

  function getWeekDay(placeDate, lang='EN', wordSize='full') {
      const daysOfWeek = {
        'EN': {
            'full': ['sunday','monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
            'short': ['Sun','Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        },
        'RU': {
            'full': ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
            'short': ['Вск', 'Пнд', 'Втр', 'Срд', 'Чтв', 'Птн', 'Сбт']
        },
        'BY': {
            'full': ['Нядзеля', 'Панядзелак', 'Аўторак', 'Серада', 'Чацвер', 'Пятніца', 'Субота'],
            'short': ['Нядзеля', 'Пнд', 'Аўт', 'Сер', 'Чцв', 'Пят', 'Суб']
        }
        };  
   return daysOfWeek[lang][wordSize][placeDate.getDay()] || false;
  }
  function getYearMonth(placeDate, lang='EN') {
    const monthOfYear = {
        'EN': ['January', 'February', 'March', 'April', 'May', 'June','July', 'August', 'September', 'October', 'November','December'],     
        'RU': ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь','июль', 'август', 'сентябрь', 'октябрь', 'ноябрь','декабрь'],
        'BY': ['Студзень', 'Люты', 'Сакавiк', 'Красавiк', 'Май', 'Червень','Лiпень', 'Жнiвень', 'Верасень', 'Кастрычнiк', 'Лiстапад','Снежань']        
        }; 
    return monthOfYear[lang][placeDate.getMonth()] || false;
  }

  function getPlaceTime(placeDate) {
      let minutes = placeDate.getMinutes();
      let seconds = placeDate.getSeconds();
      if(placeDate.getMinutes() < 10){
        minutes = `0${placeDate.getMinutes()}`;
      }
      if(seconds < 10){
          seconds = `0${seconds}`;
      }
    return `${placeDate.getHours()} : ${minutes} : ${seconds}`;
    
  }
  
  function celsiumToFarenheit(tempC) {
    tempC = Number(tempC);
    const farenheitTemperature = Math.round(tempC * (9 / 5) + 32);
    return farenheitTemperature;
}
async function getWeatherForecast(params) {
    let darkskyRequestUrl = `https://api.darksky.net/forecast/${darkskyAccessKey}/${params}?units=si`;
    
    let forecastDailyC = [];
    let forecastDailyF = [];
    let forecastTime = [];
    const urlWithProxy = proxyUrl+darkskyRequestUrl;
    const forecastData = await getDataFromUrl(urlWithProxy);    
    
    for(let i=1; i<=FORECAST_COUNT;i++){
        forecastDailyF.push(celsiumToFarenheit(forecastData.daily.data[i].temperatureHigh));
        forecastDailyC.push(Math.round(forecastData.daily.data[i].temperatureHigh));
        forecastTime.push(forecastData.daily.data[i].time)
    }
    const weatherData = {
        "temperature": {
            "C" : Math.round(forecastData.currently.temperature),
            "F" : celsiumToFarenheit(forecastData.currently.temperature)
        },
        "forecast": {
            "C":forecastDailyC,
            "F":forecastDailyF
        },
        "day": forecastTime,
        "feels": {
            "C" : Math.round(forecastData.currently.apparentTemperature),
            "F" : celsiumToFarenheit(forecastData.currently.apparentTemperature)
        }
    }
    
    localStorage.setItem('weatherData', JSON.stringify(weatherData));
    return forecastData;
   
}
function setMap(longtitude, lantitude) {
    mapboxgl.accessToken = mapboxAccessKey;
    const map = new mapboxgl.Map({
    container: 'map', 
    style: 'mapbox://styles/mapbox/streets-v11', 
    center: [longtitude, lantitude], 
    zoom: 9
    });
}
function getCoordinates(loc) {    
    loc = loc.split(',');
    let localeCoordinates = {"placeLatitude": loc[0],"placeLongtitude": loc[1]};
    return localeCoordinates;
}
function coordinatesFormat(data) {
    
    const coordinatesMinutes = Math.trunc(data);
    const coordinatesSeconds = Math.round((data - coordinatesMinutes) * 60);    
    return `${coordinatesMinutes}°${coordinatesSeconds}'`;
}
function isValidTimeZone(timezone) {
    if (!Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone) {
        throw 'error';
    }

    try {
        Intl.DateTimeFormat(undefined, {timeZone: timezone});
        return true;
    }
    catch (ex) {
        return false;
    }
}
function getTimeByZone(timeZone) {
    let dataTimeZone = new Date().toLocaleString("en-US", {timeZone: timeZone});
    dataTimeZone = new Date(dataTimeZone);
    return dataTimeZone;
   
}
function getSeason(timeString) {
    currentMonth = timeString.getMonth();
    const seasons = {
        'winter': [0, 1, 11],
        'sping': [2, 3, 4],
        'summer': [5, 6, 7],
        'autumn': [8, 9, 10]
    };

for (let key in seasons){   
     if(seasons[key].includes(currentMonth)){
         return key;        
     }
}
return false;

}
function getTimesOfDay(timeString) {
    
    let timeResponse;
    timeString = timeString.getHours();
    if(timeString > 4 && timeString < 10){
        timeResponse = 'morning';
    }
    else if(timeString > 9 && timeString < 17){
        timeResponse = 'day';
    }
    else if(timeString > 16 && timeString < 21){
        timeResponse = 'evening';
    }
    else {
        timeResponse = 'night';        
    }
    return timeResponse;
}


function showDate(currentTime, language){
    const currentDataTime = document.querySelector('.current-date');
    currentDataTime.innerHTML = '';  
    currentDataTime.innerHTML = `${getWeekDay(currentTime, language, 'short')} ${currentTime.getDate()} ${getYearMonth(currentTime,language)}`;
}

function showTime(currentTimezone) {
    const currentTime = document.querySelector('.current-time');   
    const getTime = getTimeByZone(currentTimezone);    
    const getFormattedTime = getPlaceTime(getTime);  
   
    currentTime.innerHTML = '';
    currentTime.innerHTML = getFormattedTime;
   
}

async function renderPage(location){
    let weekdateTime;
    let date;
    let weekDay;
    let forecastTemperature;
    let currentLocation;
    if(!location){
        currentLocation = await getLocation(ipinfoRequestUrl);    
       
    }
    else {
        currentLocation = location;
        
    }    
    const locales = getCoordinates(currentLocation.loc);    
    const currentCountryName = getCountryName(currentLocation.country);    
    const weatherForecast = await getWeatherForecast(`${locales.placeLatitude},${locales.placeLongtitude}`);
    currentplace.insertAdjacentHTML('afterbegin', `${currentLocation.city}, ${currentCountryName}`);

    const timeByTimezone = getTimeByZone(currentLocation.timezone);   
    const timesOfDay = getTimesOfDay(timeByTimezone);
    const yearSeason = getSeason(timeByTimezone);


    const localeImageLink = await getRemoteImage(`town,${currentLocation.city},${yearSeason},${timesOfDay},${weatherForecast.currently.summary}`);
    setElementBackground(localeImageLink);
    
    showDate(timeByTimezone, currentLang);
    showTime(currentLocation.timezone);  

    temperature.insertAdjacentHTML('afterbegin', `${Math.round(weatherForecast.currently.temperature)}${temperatureSign}`);
    const mainIcon = document.querySelector('.main-icon');
    const skycons = new Skycons({"color": "white"});   
    let iconStyle = weatherForecast.currently.icon; 
    iconStyle = iconStyle.toUpperCase();
    
    skycons.add(mainIcon, Skycons[iconStyle]);    
    weatherdescription.insertAdjacentHTML('afterbegin', `${weatherForecast.currently.summary}`);
    weatherfeels.insertAdjacentHTML('afterbegin', `${feelsLike}: ${Math.round(weatherForecast.currently.apparentTemperature)}${temperatureSign}`);
    weatherwind.insertAdjacentHTML('afterbegin', `${windTitle}: ${Math.round(weatherForecast.currently.windSpeed)}${windSpeedSi}`);
    humidity.insertAdjacentHTML('afterbegin', `${humidityTitle}: ${(weatherForecast.currently.humidity)*100}%`);   
    
    for(let i = 1; i <= FORECAST_COUNT; i++){
        weekdateTime = weatherForecast.daily.data[i].time;
        forecastTemperature = weatherForecast.daily.data[i].temperatureHigh;
        iconStyle = weatherForecast.daily.data[i].icon; 
        iconStyle = iconStyle.toUpperCase();
        date = new Date(weekdateTime * TO_SECONDS);       
        weekDay = getWeekDay(date, currentLang);
        dataforecast.insertAdjacentHTML('beforeend',
        `<div class="forecast-item">
        <div class="forecast-item__day">${weekDay}</div>
        <div class="forecast-item__wrapper">
            <div class="forecast-item__temp" id="forecasttemp">${Math.round(forecastTemperature)}${temperatureSign}</div>
            <canvas class="forecast-item__icon" id="icon${i}" width="64" height="64"></div>
        </div>
        </div>`);
        skycons.add(`icon${i}`, Skycons[iconStyle]); 
    }
    map.insertAdjacentHTML('afterend',`<div class="map-info">
    <span class="latit" id="jslatitude">Latitude: ${coordinatesFormat(locales.placeLatitude)}</span>
    <span class="longit" id="jslongitude">Longitude: ${coordinatesFormat(locales.placeLongtitude)}</span>                     
    </div>`);    
    setMap(locales.placeLongtitude,locales.placeLatitude);
    skycons.play();
    
}
 
function changeTemperature(scale){
     const storageData = JSON.parse(localStorage.getItem("weatherData"))
     temperature.innerHTML = '';
     temperature.innerHTML = storageData.temperature[scale]+temperatureSign;   
     weatherfeels.innerHTML = '';  
     weatherfeels.innerHTML = 'FEELS LIKE: '+storageData.feels[scale]+temperatureSign;   
     for(i = 0; i < FORECAST_COUNT; i++){
        forecasttemp[i].innerHTML = '';
        forecasttemp[i].innerHTML = storageData.forecast[scale][i]+temperatureSign;          
     }  
}
async function refreshBackground() {
   
    const currentLocation = await getLocation(ipinfoRequestUrl);
    const locales = getCoordinates(currentLocation.loc);    
    const weatherForecast = await getWeatherForecast(`${locales.placeLatitude},${locales.placeLongtitude}`);
    const timeByTimezone = getTimeByZone(currentLocation.timezone);   
    const timesOfDay = getTimesOfDay(timeByTimezone);
    const yearSeason = getSeason(timeByTimezone);
    const localeImageLink = await getRemoteImage(`town,${currentLocation.city},${yearSeason},${timesOfDay},${weatherForecast.currently.summary}`);
    setElementBackground(localeImageLink);
}

async function getForecastByCity(searchCity) {
    const opencageLink = `https://api.opencagedata.com/geocode/v1/json?q=${searchCity}&key=${opencagedataAccessKey}&pretty=1&no_annotations=1`;
    const searchCityData = await getDataFromUrl(opencageLink); 
    if(searchCityData.results.length > 0){
    
    const searchStatus = searchCityData.status.code;
   
    const searchCityLocale = searchCityData.results[0].geometry;
    const searchCityContinent = searchCityData.results[0].components.continent;
    const searchCityCode = searchCityData.results[0].components.country_code;
    const searchCityName = searchCity;
    const searchCityZone = `${searchCityContinent}/${searchCityName}`;
   
    if(!searchCityData.results[0].components.state_code && isValidTimeZone(searchCityZone)){
    const cityObj = {
        "loc":`${searchCityLocale.lat},${searchCityLocale.lng}`,
        "country": `${searchCityCode.toUpperCase()}`,
        "city" : `${searchCityName}`,
        "timezone" : searchCityZone
    }
   
    if(searchStatus === 200 ){
        clearPageData();
        renderPage(cityObj);
    }
}
    }


}
function search(){
     const inputData = document.querySelector('.search-input');
     if(inputData.value.length > 0){
        getForecastByCity(inputData.value);
     }
}
function clearPageData(){
    const pageClear = [currentplace,temperature,weatherdescription,weatherfeels,weatherwind,humidity,dataforecast,map];
    pageClear.forEach(element => element.innerHTML='');
    const currentDataTime = document.querySelector('.current-date');
    currentDataTime.innerHTML = ''; 
    const currentTime = document.querySelector('.current-time');
    currentTime.innerHTML = ''; 
    const mainIcon = document.querySelector('.main-icon');
    mainIcon.innerHTML = ''; 
    const mapInfo = document.querySelector('.map-info');
    mapInfo.innerHTML = ''; 
  
}
 
document.addEventListener('load', renderPage());

 const chageTempToC = document.querySelector('#radiobuttonc');
const chageTempToF = document.querySelector('#radiobuttonf');
const refreshButton = document.querySelector('.button-update');
const searchButton = document.querySelector('.search-submit');
 refreshButton.addEventListener('click', refreshBackground);
  chageTempToC.addEventListener('click', ()=>{changeTemperature('C')});
  chageTempToF.addEventListener('click', ()=>{changeTemperature('F')});
  searchButton.addEventListener('click', search);