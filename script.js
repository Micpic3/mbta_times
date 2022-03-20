/* global ol */

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

  async refreshRoutes() {
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
          route.clearVehicles();
          const allTrains = data["data"];
          allTrains.forEach((train) => {
            const attributes = train["attributes"];
            const lat = attributes["latitude"];
            const long = attributes["longitude"];
            const bearing = attributes["bearing"];
            const vehicle = new Vehicle(lat, long, bearing);
            route.addVehicle(vehicle);
          });

          console.log("Done refresh");
          console.log(route);
        })
        .catch((error) => console.log(error));
    });
  }

  async refreshRoutes2() {
    this.routes.forEach(async (route) => {
      const url = `https://api-v3.mbta.com/vehicles?sort=-speed&filter%5Broute%5D=${route.id}`;
      console.log("Sending request for:", route.id);
      const response = await fetch(url);
      console.log("After request for:", route.id);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();

      route.clearVehicles();
      const allTrains = data["data"];
      allTrains.forEach((train) => {
        const attributes = train["attributes"];
        const lat = attributes["latitude"];
        const long = attributes["longitude"];
        const bearing = attributes["bearing"];
        const vehicle = new Vehicle(lat, long, bearing);
        route.addVehicle(vehicle);
      });
    });
  }
}

class RoutesDrawer {
  constructor(map) {
    this.map = map;
    this.idsToVectorSource = {};
  }

  drawRoutes(routes) {
    routes.forEach((route) => {
      if (!this.idsToVectorSource[route.id]) {
        const vectorSource = new ol.source.Vector();
        const vectorLayer = new ol.layer.Vector({
          source: vectorSource,
          style: new ol.style.Style({
            image: new ol.style.Circle({
              radius: 5,
              fill: new ol.style.Fill({ color: route.color }),
              stroke: new ol.style.Stroke({
                color: "#000000",
                width: 3,
              }),
            }),
          }),
        });
        this.idsToVectorSource[route.id] = vectorSource;
        this.map.addLayer(vectorLayer);
      }

      const routeVectorSource = this.idsToVectorSource[route.id];
      routeVectorSource.clear();
      route.vehicles.forEach((vehicle) => {
        console.log({ vehicle });
        const point = ol.proj.fromLonLat([vehicle.longitude, vehicle.latitude]);
        routeVectorSource.addFeature(new ol.Feature(new ol.geom.Point(point)));
      });
    });
  }
}

async function main() {
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
  const routesDrawer = new RoutesDrawer(map);
  const routes = new Routes();
  routes.addRoute("Red", "red");
  routes.addRoute("741", "gray");

  await routes.refreshRoutes2();
  //   console.log("here");
  //   routesDrawer.drawRoutes(routes.routes);
}

main();

/* eslint-disable  no-undef */
/* eslint-disable no-unused-vars */
/* eslint-enable no-unused-vars */
/* eslint-enable no-undef */
