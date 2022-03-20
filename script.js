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

/* eslint-enable no-unused-vars */
/* eslint-enable no-undef */

/* eslint-disable  no-undef */
const idsToVectorSource = {};
function registerRoute(id, fillColor) {
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

// function refreshAllRoutes() {
//   const urlsObjs = [
//     {
//       url: "https://api-v3.mbta.com/vehicles?sort=-speed&filter%5Broute%5D=741",
//       id: "741",
//     },
//     {
//       url: "https://api-v3.mbta.com/vehicles?sort=-speed&filter%5Broute%5D=Red",
//       id: "Red",
//     },
//   ];
//   urlsObjs.forEach((urlObj) => {
//     fetch(urlObj.url)
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(`Request failed with status ${response.status}`);
//         }
//         return response.json();
//       })
//       .then((data) => {
//         console.log(data);

//         const vectorSource = idsToVectorSource[urlObj.id];

//         clearPoints(vectorSource);

//         const allTrains = data["data"];
//         allTrains.forEach((train) => {
//           const attributes = train["attributes"];
//           const lat = attributes["latitude"];
//           const long = attributes["longitude"];
//           console.log("The lat long:", lat, long);
//           addPoint(lat, long, vectorSource);
//         });
//       })
//       .catch((error) => console.log(error));
//   });
// }

// registerRoute("Red", "red");
// registerRoute("741", "gray");
// refreshAllRoutes(urls);
// setInterval(() => refreshAllVehicles(urls), 5000);

class Vehicle {
  constructor(lat, long, bearing) {
    this.latitude = lat;
    this.longitude = long;
    this.bearing = bearing;
  }
}
class Route {
  constructor(id, color) {
    this.id = id;
    this.color = color;
    this.vehicles = [];
  }

  addVehicle(vehicle) {
    this.vehicles.push(vehicle);
  }

  clearVehicles() {
    this.vehicles = [];
  }
}

class Routes {
  constructor() {
    this.routes = [];
  }

  addRoute(id, color) {
    this.routes.push(new Route(id, color));
  }

  refreshRoutes() {
    this.routes.forEach((route) => {
      const url = `https://api-v3.mbta.com/vehicles?sort=-speed&filter%5Broute%5D=${route.id}`;
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          //   console.log(data);

          //   const vectorSource = idsToVectorSource[route.id];

          //   clearPoints(vectorSource);

          route.clearVehicles();
          const allTrains = data["data"];
          allTrains.forEach((train) => {
            const attributes = train["attributes"];
            const lat = attributes["latitude"];
            const long = attributes["longitude"];
            const bearing = attributes["bearing"];
            const vehicle = new Vehicle(lat, long, bearing);
            route.addVehicle(vehicle);
            // addPoint(lat, long, vectorSource);
          });

          console.log(route);
        })
        .catch((error) => console.log(error));
    });
  }
}

function drawRoute(route) {}

const routes = new Routes();
routes.addRoute("Red", "red");
routes.addRoute("741", "gray");
routes.refreshRoutes();
