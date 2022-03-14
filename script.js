/* eslint-disable no-unused-vars */
/* eslint-disable  no-undef */
const bos_lat = 42.361145;
const bos_long = -71.057083;
const map = new ol.Map({
  target: "map",
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
      //   source: new ol.source.Stamen({ layer: "watercolor" }),
    }),
    new ol.layer.Tile({
      source: new ol.source.OSM(),
      //   source: new ol.source.Stamen({ layer: "terrain-labels" }),
    }),
  ],
  view: new ol.View({
    // center: ol.proj.fromLonLat([-106.123148, 40.701464]),
    // multiWorld: true,
    center: ol.proj.fromLonLat([bos_long, bos_lat]),
    zoom: 13,
  }),
});

console.log(ol.proj.fromLonLat([-106.123148, 40.701464]));

const point = ol.proj.fromLonLat([-106.123148, 40.701464]);
// const point = [5e6, 7e6];

// const vectorSource = new ol.source.Vector();
// // vectorSource.addFeature(new ol.Feature(new ol.geom.Circle([5e6, 7e6], 1e6)));
// // vectorSource.addFeature(new ol.Feature(new ol.geom.Circle(point, 1e6)));
// vectorSource.addFeature(new ol.Feature(new ol.geom.Point(point)));

// const vectorLayer = new ol.layer.Vector({
//   source: vectorSource,
//   style: new ol.style.Style({
//     image: new ol.style.Circle({
//       radius: 2,
//       fill: new ol.style.Fill({ color: "red" }),
//     }),
//   }),
// });
// const getRandomNumber = function (min, ref) {
//   return Math.random() * ref + min;
// };
// const features = [];
// for (i = 0; i < 300; i++) {
//   features.push(
//     new ol.Feature(
//       new ol.geom.Point(
//         ol.proj.fromLonLat([-getRandomNumber(50, 50), getRandomNumber(10, 50)])
//       )
//     )
//   );
// }
// // create the source and layer for random features
// const vectorSource = new ol.source.Vector({
//   features,
// });
// const vectorLayer = new ol.layer.Vector({
//   source: vectorSource,
//   style: new ol.style.Style({
//     image: new ol.style.Circle({
//       radius: 1,
//       fill: new ol.style.Fill({ color: "red" }),
//     }),
//   }),
// });

// var vectorLayer = new ol.layer.Vector({
//   source: vectorSource,
//   //   style: styleFunction,
// });

// const fillStyle = new ol.style.Fill({
//   color: [255, 0, 0, 0.3],
// });

// const strokeStyle = new ol.style.Stroke({
//   color: [255, 0, 0, 1],
//   width: 1.0,
// });

// const exampleLayer = new ol.layer.VectorImage({
//   source: new ol.source.Vector({
//     url: "./data/path.geojson",
//     format: new ol.format.GeoJSON(),
//   }),
//   visible: true,
//   title: "example Polygons",
//   style: new ol.style.Style({
//     fill: fillStyle,
//     stroke: strokeStyle,
//   }),
// });

// const vectorSource2 = new ol.source.Vector({
//   url: "./data/path.geojson",
//   format: new ol.format.GeoJSON(),
// });

// const pointsLayer = new WebGLPointsLayer({
//   source: vectorSource2,
//   //   style: newStyle,
//   disableHitDetection: true,
// });
// map.addLayer(pointsLayer);

// map.addLayer(vectorLayer);
// map.addLayer(exampleLayer);
/* eslint-enable no-unused-vars */
/* eslint-enable no-undef */

// map.addEventListener("click", (e) => {
//   console.log(e);
// });

const addPointButton = document.querySelector(".input-button");

/* eslint-disable  no-undef */
const idsToVectorSource = {};
function registerVehicle(id, fillColor) {
  const vectorSource = new ol.source.Vector();
  const vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({ color: fillColor }),
        stroke: new ol.style.Stroke({
          color: "#000000",
          width: 3,
        }),
      }),
    }),
  });
  map.addLayer(vectorLayer);
  idsToVectorSource[id] = vectorSource;
}

function clearPoints(vector) {
  vector.clear();
}

function addPoint(lat, long, vector) {
  const point = ol.proj.fromLonLat([long, lat]);
  vector.addFeature(new ol.Feature(new ol.geom.Point(point)));
}
/* eslint-enable no-undef */

function handleClick(e) {
  const lat = document.querySelector(".lat-input").value;
  const long = document.querySelector(".long-input").value;
  console.log(lat, long);
  addPoint(lat, long, idsToVectorSource[0]);
}
addPointButton.addEventListener("click", handleClick);

document.querySelector(".lat-input").value = bos_lat.toString();
document.querySelector(".long-input").value = bos_long.toString();

// fetch(
//   "https://api-v3.mbta.com/vehicles?page%5Boffset%5D=0&page%5Blimit%5D=1&sort=bearing"
// )
//   .then((response) => {
//     if (!response.ok) {
//       throw new Error(`Request failed with status ${response.status}`);
//     }
//     return response.json();
//   })
//   .then((data) => {
//     console.log(data);
//   })
//   .catch((error) => console.log(error));

function getAllVehicles() {
  const urls = [
    "https://api-v3.mbta.com/vehicles?sort=-speed&filter%5Broute%5D=741",
    "https://api-v3.mbta.com/vehicles?sort=-speed&filter%5Broute%5D=Red",
  ];
  urls.forEach((url) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);

        clearPoints(vectorSource);
        const allTrains = data["data"];

        allTrains.forEach((train) => {
          const attributes = train["attributes"];
          const lat = attributes["latitude"];
          const long = attributes["longitude"];
          console.log("The lat long:", lat, long);
          addPoint(lat, long, vectorSource);
        });
      })
      .catch((error) => console.log(error));
  });
}

// function getMBTALocation() {
//   console.log("Getting location.");

//   fetch(
//     "https://api-v3.mbta.com/vehicles?page%5Boffset%5D=0&page%5Blimit%5D=1&sort=label"
//   )
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`Request failed with status ${response.status}`);
//       }
//       return response.json();
//     })
//     .then((data) => {
//       const attributes = data["data"][0]["attributes"];
//       const lat = attributes["latitude"];
//       const long = attributes["longitude"];
//       console.log("The lat long:", lat, long);
//       addPoint(lat, long, vectorSource);
//     })
//     .catch((error) => console.log(error));
// }

// getAllVehicles(urls);
// setInterval(() => getAllVehicles(urls), 5000);
// getMBTALocation();
// setInterval(getMBTALocation, 5000);
