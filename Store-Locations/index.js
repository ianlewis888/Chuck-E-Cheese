const axios = require('axios'),
  xpath = require('xpath'),
  dom = require('xmldom').DOMParser,
  fs = require('fs'),
  csv = require('fast-csv');
var fullLocations = [["name","address",'phone',"latitude","longitude"]];
axios.get("https://www.chuckecheese.com/location-index")
  .then(res => {
    const xml = res.data.toString();
    const doc = new dom().parseFromString(xml);
    const cityNodes = xpath.select("//div[@class=\"state-group\"]/a/strong", doc);
    const locations = locationParser(cityNodes);
  });

function getCoords(address) {
  const key;
  return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}`)
    .then(res => {
      console.log(res.data);
      var coords;
      if (res.data.results[0] && res.data.results[0].geometry) {
        coords = {
          lat: res.data.results[0].geometry.location.lat,
          lon: res.data.results[0].geometry.location.lng
        };
      }
      else {
        coords = { lat: "error", lon: "error" }
      }
      return coords;
    }).catch(e => { return { lat: "error", lon: "error" }; });
}

function locationParser(cityNodes) {
  var locations = [];
  for (var i in cityNodes) {
    const city = cityNodes[i];
    const cityName = city.firstChild.nodeValue;
    const locationUrl = `https://www.chuckecheese.com${city.parentNode.attributes[0].nodeValue}`;
    const state = city.parentNode.parentNode.childNodes[1].firstChild.nodeValue.split(" - ")[0];
    const address = city.parentNode.childNodes[1].nodeValue.replace(" - ", "");
    const fullAddress = `${address}, ${cityName}, ${state}`;
    locations.push([`Chuck E. Cheese ${cityName}`, fullAddress, "", "", ""]);
  }
  // console.log(locations)
  locations.forEach((e, i)=>{
    getCoords(e[1]).then(coords => {
      locations[i][3] = coords.lat;
      locations[i][4] = coords.lon;
      fullLocations.push(locations[i]);
    });
  });
}

setTimeout(() => {
  csv.writeToPath(__dirname+"/cc-coords.csv", fullLocations, {headers: true})
     .on("finish", function(){
         console.log("done!");
     });
}, 60000);
