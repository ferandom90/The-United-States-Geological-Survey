
window.addEventListener("load",()=>{

// intialize a map with default center position and zoom using leaflet

  const map = L.map('map', {
    center: [37.8, -40.9],
    zoom: 3,
});

// call corresponding functions and assign their returns data to the followed variables

const earthquakesLayer = generateLayers(map);

const legendColors = generateLegend(map);

plotEarthQuakes(map,legendColors,earthquakesLayer);
    
});






const generateLayers = (map) =>{

// storage token for custom map layers views

const token = "pk.eyJ1Ijoiam9jYWhlOTgwMzExIiwiYSI6ImNsanhjenUyMDB5MDkzZ3FmMWRxbmF5MGUifQ.4aCxFQOV8CByNdSbO0CkbQ";

// create different leaflet layer mapbox views for customization of the map

const satelliteLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  id: 'mapbox/satellite-v9',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: token
});

const outdoorLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  id: 'mapbox/outdoors-v11',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: token
});

const grayscaleLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  id: 'mapbox/light-v10',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: token
});


// Set the default layer
satelliteLayer.addTo(map);

// Create a layer control
const baseLayers = {
  "Satellite": satelliteLayer,
  "Outdoor": outdoorLayer,
  "Grayscale": grayscaleLayer
};


// Create the earthquakes points overlay layer
const earthquakesLayer = L.layerGroup();

const overlays = {
  "Earthquakes": earthquakesLayer
}


// add the mapbox custom map layers and earthquakes layer to the map using leaflet
L.control.layers(baseLayers,overlays).addTo(map);

return earthquakesLayer;

}






const generateLegend = (map) => {

  // create a JSON object for the legend control in map

const legendColors = [
  { color: ' #1aff1a', label: '-10-10' },
  { color: '#ccff66', label: '10-30' },
  { color: '#ffd633', label: '30-50' },
  { color: '#ffa64d', label: '50-70' },
  { color: 'darkorange', label: '70-90' },
  { color: 'red', label: '90+' }
];


// create the legend control using leaflet

const legend = L.control({ position: 'bottomright' });


// when legend is added create the corresponding div elements to display the depth and score color

legend.onAdd = function () {
const div = L.DomUtil.create('div', 'legend');

 // Iterate over the legend colors and create the legend items
 for (let i = 0; i < legendColors.length; i++) {

  const legendColor = legendColors[i].color;
  const legendLabel = legendColors[i].label;

  const legendItem = document.createElement('div');
  legendItem.className = 'legend-item';

  const colorDiv = document.createElement('div');
  colorDiv.className = 'legend-color';
  colorDiv.style.backgroundColor = legendColor;

  const labelSpan = document.createElement('span');
  labelSpan.textContent = legendLabel;

  legendItem.appendChild(colorDiv);
  legendItem.appendChild(labelSpan);

  div.appendChild(legendItem);
}

return div;
};

// add the legend control to the map

legend.addTo(map);

return legendColors;

}







const plotEarthQuakes = (map,legendColors,earthquakesLayer) =>{

  // request the data from geojson earthquakes using d3

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(function(data){

  // optional log the data

  //console.log(data);

  // create an object for each feature at the particular data we are looking for on the features

  const features =  data.features.map(element => {

       return  {
           Place:element.properties.place,
           Magnitude:element.properties.mag,
           Longitude:element.geometry.coordinates[0],
           Latitude:element.geometry.coordinates[1],
           Depth:element.geometry.coordinates[2]
         };
    
   });

   // optional log the mapped and transformed data

   //  console.log(features);


   // in the new features object iterate and start plotting on the map

    features.forEach(element => {


        // Define the scale range for the radius
        let radiusScale = d3.scaleLinear()
        .domain([0,6]) // Define the minimum and maximum magnitude values
        .range([5, 15]); // Define the minimum and maximum radius values

        // Calculate the scaled radius for each earthquake
        let scaledRadius = radiusScale(element.Magnitude);

        // assign the earthquake color based on the depth 

        const point_color = color_fill(element,legendColors);

        // create a geojsonmarker options for each earthquake style properties

        let geojsonMarkerOptions = {
            radius: scaledRadius,
            fillColor:  point_color,
            color: "#000000",
            weight: 1,
            opacity: 1,
            fillOpacity: 1
          };

      // create the geojsonfeature, assign the longitude and latitude

         let geojsonFeature = {
            "type": "Feature",
            "properties": {
            },
            "geometry": {
              "type": "Point",
              "coordinates": [element.Longitude, element.Latitude]
            }
          }; 

  // Create a circle marker for each feature and add it to the map
  // assign a popup to each marker with their corresponding data
  // assign also its own markeroptions 
  // finally add to the earthquakes layer each of the markers
  L.geoJSON(geojsonFeature, {
    pointToLayer: function (feature, latlng) {
      const popupContent = `Place:${element.Place}<br>
      Depth:${element.Depth}<br>
      Magnitude:${element.Magnitude}<br>
      Longitude:${element.Longitude}<br>
      Latitude:${element.Latitude}
      `;
      const marker =  L.circleMarker(latlng, geojsonMarkerOptions);
      marker.bindPopup(popupContent);
      return marker;
    }
  }).addTo(earthquakesLayer);
});

// add the earthquakesLayer to the map

earthquakesLayer.addTo(map);

 })

 .catch(function(error){
        console.log(error);
 })
}







const color_fill = (element,legendColors) =>{

    // determine color of the earthquake based on the depth 
    
    if(element.Depth>=-10 && element.Depth<10){
        return legendColors[0].color;
    }
    if(element.Depth>=10 && element.Depth<30){
        return legendColors[1].color;
    }
    if(element.Depth>=30 && element.Depth<50){
        return legendColors[2].color;
    }
    if(element.Depth>=50 && element.Depth<70){
        return legendColors[3].color;
    }
    if(element.Depth>=70 && element.Depth<90){
        return legendColors[4].color;
    }
    return legendColors[5].color;

}


