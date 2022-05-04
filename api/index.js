import express, { json } from "express";
import MENU from "./menu.js";
import CONFIG from "./config.js";
import axios from "axios";
import fetch from "node-fetch";

const APP = express();
const PORT = 8080;

/**
 * All the constants used to be easily modified.
 */
const WELCOME_MESSAGE =
  "Bonjour, bienvenue sur SandWish, le souhait des sandwiches! Qu'est-ce que je peux faire pour vous ? 🤖";
const SCHEDULE =
  "Nos sommes ouvert tous les jours sauf le dimanche, de 9h à 17h30! 🕐";
const HUNGRY_MSG = [
  "Personnellement, ça me donne très faim. 😋",
  "Ca me donne un petit creux de parler de ça... 🍴",
  "Je sais pas vous, mais j'aurais bien pris celui-ci moi. 😏",
];

/**
 * Force to use the json middleware to talk with the API using json format.
 */
APP.use(json());

/**
 * Launch the API on localhost with the given port.
 */
APP.listen(PORT, () =>
  console.log(`L'API tourne sur http://localhost:${PORT}`)
);

APP.get("/menu", async (req, res) => {
  res.send({ menu: getSandwichesList() });
});

APP.get("/details", async (req, res) => {
  res.send({ details: getSandwichDetails(req.rawHeaders[11].toLowerCase()) });
});

APP.get("/price", async (req, res) => {
  let totalPrice = 0;
  req.rawHeaders[11].split(";").forEach((allSandwichInfo) => {
    //example of sandwichInfo: 3/Salami/Grand
    try {
      let sandwichInfo = allSandwichInfo.split("/");
      console.log(sandwichInfo);
      totalPrice +=
        parseInt(sandwichInfo[0]) *
        MENU.sandwiches[0][sandwichInfo[1].toLowerCase()].price;
    } catch (e) {
      return;
    }
  });
  res.send({ price: totalPrice });
});

APP.get("/delivery", async (req, res) => {
  let finalRes = "";
  let deliveryMin = 0;
  let requestIsOk = false;
  try {
    var city = req.rawHeaders[9];
    var restaurantLocation = "50.666180,5.632890";
    console.log("city is: " + city);
    console.log(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}, belgium&limit=10&appid=${CONFIG.OPENWEATHERAPI_KEY}`
    );
    await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}, belgium&limit=10&appid=${CONFIG.OPENWEATHERAPI_KEY}`
    )
      .then((resp) => resp.json())
      .then(async (data) => {
        console.log("first fetch is ok");
        var weatherInfo = await getWeatherInfo(data[0].lat, data[0].lon);
        /**
         * Making the request to have the estimated time to deliver the order.
         */
        var options = {
          method: "GET",
          url: "https://trueway-matrix.p.rapidapi.com/CalculateDrivingMatrix",
          params: {
            origins: restaurantLocation,
            destinations: `${data[0].lat},${data[0].lon}`,
          },
          headers: {
            "x-rapidapi-host": "trueway-matrix.p.rapidapi.com",
            "x-rapidapi-key": CONFIG.RAPIDAPI_KEY,
          },
        };
        await axios
          .request(options)
          .then((response) => {
            console.log("axios fetch is ok");
            var minutes = Math.floor(response.data.durations[0][0] / 60);
            //calcul detail: travel time + preparation time + 5 minutes in case of a little problem or something else.
            deliveryMin = minutes;
            finalRes = weatherInfo;
            requestIsOk = true;
            console.log("gg wp");
          })
          .catch((error) => {
            finalRes =
              "Désolé, je n'ai pas réussi à calculer le temps de livraison. Pouvez-vous me redonner votre adresse svp?";
          });
      })
      .catch((error) => {
        console.log("the error is: " + error);
        finalRes =
          "Désolé, je n'ai pas réussi à calculer le temps de livraison. Pouvez-vous me redonner votre adresse svp?";
      });
  } catch (e) {
    console.log("c'est cassé");
    finalRes =
      "Désolé, je n'ai pas réussi à calculer le temps de livraison. Pouvez-vous me redonner votre adresse svp?";
  }
  res.send({ request: requestIsOk, text: finalRes, time: deliveryMin });
});

async function getWeatherInfo(lat, lon) {
  var url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.OPENWEATHERAPI_KEY}&units=metric&lang=fr`;
  var response = "";
  await fetch(url)
    .then((resp) => resp.json())
    .then(function (data) {
      // openweathermap.org has a list with code to help filter all the weather values possible.
      // link: https://openweathermap.org/weather-conditions
      var weatherId = data.weather[0].id;
      var troubleMsg =
        weatherId >= 500 && weatherId < 700
          ? "nous aurons peut-être un peu de retard, veuillez nous excuser si c'est le cas."
          : "nous ne devrions pas avoir de retard.";
      response = `Étant donné qu'il fait ${data.weather[0].description} chez vous, ${troubleMsg}`;
      console.log("weather info is ok");
    })
    .catch(function (error) {
      response = "";
    });
  return response;
}

/**
 * Get all the sandwiches.
 * @returns the menu with all the sandwiches.
 */
function getSandwichesList() {
  var sandwiches = "";
  var allSandwiches = MENU.sandwiches[0];
  for (var key in allSandwiches) {
    if (allSandwiches.hasOwnProperty(key)) {
      sandwiches += `- ${allSandwiches[key].name} \n`;
    }
  }

  return `Voici notre menu 🥪\n\n${sandwiches}\nPour la taille, nous avons les petits sandwiches de 22cm de long ou bien les grands de 32cm!\n\nPour avoir les ingrédients d'un sandwich, n'hésitez pas à demander!`;
}

/**
 * Get all the ingredients of a specific sandwich.
 * @param {*} id : the id of the sandwich (the id is the name concatenated).
 * @returns a text with all the ingredients and the name of the sandwich.
 */
function getSandwichDetails(id) {
  var name = "";
  var ingredients = "";
  if (id.length > 0) {
    var allSandwiches = MENU.sandwiches[0];
    if (allSandwiches.hasOwnProperty(id) && id.length > 0) {
      allSandwiches[id].ingredients.forEach((ingr) => {
        ingredients += `${ingr},`;
      });
      ingredients = ingredients.substring(0, ingredients.length - 2);
      name = allSandwiches[id].name;
    } else {
      return "Désolé, je n'ai pas pu trouver de sandwich avec le nom que vous m'avez donné, pouvez-vous le réécrire ?";
    }
  } else {
    return "Désolé, je n'ai pas pu trouver de sandwich avec le nom que vous m'avez donné, pouvez-vous le réécrire ?";
  }
  return `Voici les détails du '${name}': ${ingredients}.\n\n${
    HUNGRY_MSG[getRandomInt(3)]
  }`;
}

/**
 * Get a random number between 0 and "max" (not included).
 * @param {*} max the maximum value you want -1 ("max" is not included in the possible random number).
 * @returns the random number.
 */
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
