const axios = require('axios'),
  xpath = require('xpath'),
  dom = require('xmldom').DOMParser,
  fs = require('fs'),
  csv = require('fast-csv');

axios.get("https://www.chuckecheese.com/location-index")
  .then(res => {
    const xml = res.data.toString();
    const doc = new dom().parseFromString(xml);
    const cityNodes = xpath.select("//div[@class=\"state-group\"]/a/strong", doc);
    const locations = locationParser(cityNodes);
    csv.writeToPath(__dirname+"/cc-locations.csv", locations, {headers: true})
       .on("finish", function(){
           console.log("done!");
       });
  });

function locationParser(cityNodes) {
  var locations = [["State", "City", "Address", "URL"]];
  for (var i in cityNodes) {
    const city = cityNodes[i];
    const cityName = city.firstChild.nodeValue;
    const locationUrl = `https://www.chuckecheese.com${city.parentNode.attributes[0].nodeValue}`;
    const state = city.parentNode.parentNode.childNodes[1].firstChild.nodeValue;
    const address = city.parentNode.childNodes[1].nodeValue.replace(" - ", "");
    locations.push([state, cityName, address, locationUrl]);
  }
  return locations;
}
