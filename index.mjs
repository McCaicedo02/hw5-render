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
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/insights", label: "Insights" },
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

function getStudioProfile() {
  faker.seed(336);

  return {
    mentor: {
      name: faker.person.fullName(),
      title: "Creative Coding Mentor",
      email: faker.internet.email().toLowerCase(),
      focus: faker.helpers.arrayElement([
        "Accessible interfaces",
        "Express routing",
        "Responsive layouts",
        "API storytelling"
      ])
    },
    feedback: [
      {
        title: "Peer review energy",
        stat: `${faker.number.int({ min: 88, max: 98 })}%`,
        text: "Students said the project felt organized, easy to navigate, and more polished than the original static version."
      },
      {
        title: "Route coverage",
        stat: `${faker.number.int({ min: 5, max: 7 })} views`,
        text: "The Express version expands the original portfolio into a more complete site with room for API and package-driven content."
      },
      {
        title: "Mock studio note",
        stat: faker.helpers.arrayElement(["Ready to deploy", "Feedback-friendly", "Backend powered"]),
        text: faker.company.catchPhrase()
      }
    ],
    officeHours: faker.helpers.arrayElements(
      [
        "Monday 3:30 PM",
        "Tuesday 5:00 PM",
        "Wednesday 1:15 PM",
        "Thursday 6:45 PM",
        "Friday 10:00 AM"
      ],
      3
    )
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
  const studio = getStudioProfile();

  res.render("index", {
    pageTitle: "Home",
    weather,
    weatherLabel: weather.current ? getWeatherLabel(weather.current.weatherCode) : "Unavailable",
    studio
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    pageTitle: "About",
    studio: getStudioProfile()
  });
});

app.get("/projects", (req, res) => {
  res.render("projects", {
    pageTitle: "Projects",
    studio: getStudioProfile()
  });
});

app.get("/insights", async (req, res) => {
  const weather = await getWeatherSnapshot();

  res.render("insights", {
    pageTitle: "Insights",
    weather,
    weatherLabel: weather.current ? getWeatherLabel(weather.current.weatherCode) : "Unavailable"
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    pageTitle: "Contact",
    studio: getStudioProfile()
  });
});

if (process.argv[1] === __filename) {
  app.listen(PORT, () => {
    console.log(`HW5 app listening on port ${PORT}`);
  });
}

export default app;
