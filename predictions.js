const stopIntervalIDs = [];
const intervalIDs = [];
async function main() {
  console.log("Starting");

  const predictionsDiv = document.querySelector(".predictions");
  const locationButtonTemplate = document.querySelector(
    ".location-button-template"
  );

  const predictionTemplate = document.querySelector(".prediction-template");
  const locationContainers = document.querySelector(".location-containers");

  // const url = "https://api-v3.mbta.com/stops?filter%5Broute%5D=Red";
  const url = "https://api-v3.mbta.com/stops?filter%5Broute%5D=741";
  const response = await fetch(url);
  const data = await response.json();

  const locations = data["data"];
  for (const location of locations) {
    const locationName = location["attributes"]["name"];

    const newLocationButton = locationButtonTemplate.content
      .cloneNode(true)
      .querySelector(".location-button");
    newLocationButton.textContent = locationName;
    newLocationButton.dataset.stopid = location["id"];
    newLocationButton.addEventListener("click", async (e) => {
      stopIntervalIDs.forEach((stopIntervalID) => {
        clearInterval(stopIntervalID);
      });
      async function setPredictions() {
        console.log(e.target.dataset.stopid);
        // const response = await fetch(
        //   `https://api-v3.mbta.com/predictions?page%5Boffset%5D=0&page%5Blimit%5D=9&filter%5Bstop%5D=${e.target.dataset.stopid}`
        // );

        const response = await fetch(
          `https://api-v3.mbta.com/predictions?sort=-arrival_time&page%5Boffset%5D=0&page%5Blimit%5D=100&filter%5Bstop%5D=${e.target.dataset.stopid}`
        );
        const resJSON = await response.json();
        const predictions = resJSON["data"]
          .filter((pred) => {
            return pred["attributes"]["arrival_time"] != null;
          })
          .reverse()
          .slice(0, 10);
        // const predictions = resJSON["data"].reverse();
        console.log({ predictions });
        const now = Date.now();
        predictionsDiv.innerHTML = "";
        intervalIDs.forEach((intervalID) => {
          clearInterval(intervalID);
        });
        for (const prediction of predictions) {
          console.log(
            "Arrival time:",
            prediction["attributes"]["arrival_time"]
          );
          const arrival_time = prediction["attributes"]["arrival_time"];
          if (arrival_time === null) {
            continue;
          }
          let direction = null;
          if (prediction["attributes"]["direction_id"] == "1") {
            direction = "Inbound";
            // direction = "Alewife";
          } else {
            direction = "Outbound";
            // direction = "Ashmont/Braintree";
          }

          const arrival_time_epoch = Date.parse(arrival_time);

          const eta_millis = arrival_time_epoch - now;

          if (eta_millis < 0) {
            continue;
          }

          const eta_minutes = millisToMinutesAndSeconds(eta_millis);
          const newPredictionDiv = predictionTemplate.content
            .cloneNode(true)
            .querySelector(".prediction");

          const newPredictionTimeDiv =
            newPredictionDiv.querySelector(".prediction-time");

          const newPredictionDirectionDiv = newPredictionDiv.querySelector(
            ".prediction-direction"
          );

          newPredictionTimeDiv.textContent = eta_minutes;
          newPredictionDirectionDiv.textContent = direction;
          predictionsDiv.appendChild(newPredictionDiv);
          const intervalID = setInterval(() => {
            const now = Date.now();
            const eta_millis = arrival_time_epoch - now;
            const eta_minutes = millisToMinutesAndSeconds(eta_millis);
            newPredictionTimeDiv.textContent = eta_minutes;
          }, 1000);
          intervalIDs.push(intervalID);
        }
      }

      setPredictions();
      stopIntervalIDs.push(setInterval(setPredictions, 10000));
    });
    locationContainers.appendChild(newLocationButton);
  }
}
function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

main();
