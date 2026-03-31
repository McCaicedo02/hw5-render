import express from "express";
import axios from "axios";
import { faker } from "@faker-js/faker";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

const navigation = [
  { href: "/", label: "Home" },
  { href: "/windows", label: "Windows" },
  { href: "/linux", label: "Linux" },
  { href: "/macos", label: "macOS" },
  { href: "/contact", label: "Contact" }
];

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.locals.navigation = navigation;
  res.locals.currentPath = req.path;
  next();
});

function getStudyProfile() {
  faker.seed(336);

  return {
    assistant: {
      name: faker.person.fullName(),
      title: "Systems Study Assistant",
      focus: faker.helpers.arrayElement([
        "Process management",
        "Memory organization",
        "Security and permissions",
        "File system structure"
      ])
    },
    labNote: faker.helpers.arrayElement([
      "Compare how each operating system balances usability and system control.",
      "Notice how security, compatibility, and interface design affect everyday use.",
      "Think about which platform is best suited for beginners, developers, and enterprise use."
    ]),
    discussionPrompt: faker.helpers.arrayElement([
      "Which operating system is most practical for general users?",
      "Why is Linux so common in server environments?",
      "How much should interface design matter when evaluating an operating system?"
    ]),
    studyTimes: faker.helpers.arrayElements(
      ["Monday 3:30 PM", "Tuesday 5:00 PM", "Wednesday 1:15 PM", "Thursday 6:45 PM", "Friday 10:00 AM"],
      3
    ),
    contactEmail: faker.internet.email().toLowerCase()
  };
}

async function getWeatherSnapshot() {
  const url = "https://api.open-meteo.com/v1/forecast";

  try {
    const { data } = await axios.get(url, {
      params: {
        latitude: 36.6002,
        longitude: -121.8947,
        current: "temperature_2m,wind_speed_10m,weather_code",
        daily: "temperature_2m_max,temperature_2m_min",
        temperature_unit: "fahrenheit",
        wind_speed_unit: "mph",
        timezone: "America/Los_Angeles",
        forecast_days: 3
      }
    });

    return {
      current: {
        temperature: Math.round(data.current.temperature_2m),
        windSpeed: Math.round(data.current.wind_speed_10m),
        weatherCode: data.current.weather_code
      },
      forecast: data.daily.time.map((day, index) => ({
        day,
        high: Math.round(data.daily.temperature_2m_max[index]),
        low: Math.round(data.daily.temperature_2m_min[index])
      }))
    };
  } catch (error) {
    return {
      error: "Weather details are temporarily unavailable.",
      current: null,
      forecast: []
    };
  }
}

function getWeatherLabel(code) {
  const labels = {
    0: "Clear sky",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Rime fog",
    51: "Light drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Snow",
    80: "Rain showers",
    95: "Thunderstorm"
  };

  return labels[code] || "Changing conditions";
}

app.get("/", async (req, res) => {
  const weather = await getWeatherSnapshot();
  const study = getStudyProfile();

  res.render("index", {
    pageTitle: "Home",
    weather,
    weatherLabel: weather.current ? getWeatherLabel(weather.current.weatherCode) : "Unavailable",
    study
  });
});

app.get("/windows", (req, res) => {
  res.render("windows", {
    pageTitle: "Windows",
    study: getStudyProfile()
  });
});

app.get("/linux", (req, res) => {
  res.render("linux", {
    pageTitle: "Linux",
    study: getStudyProfile()
  });
});

app.get("/macos", (req, res) => {
  res.render("macos", {
    pageTitle: "macOS",
    study: getStudyProfile()
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    pageTitle: "Contact",
    study: getStudyProfile()
  });
});

if (process.argv[1] === __filename) {
  app.listen(PORT, () => {
    console.log(`HW5 app listening on port ${PORT}`);
  });
}

export default app;
