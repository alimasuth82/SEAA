# 🌍 Smart Bucket List – Frontend
This web application lets users explore travel information about any country in the world. It shows the country’s capital, currency, population, languages, and region, along with the best time to visit and famous foods. Users can also create a small travel checklist.

---

## ⚙️ How to Run the App
1. Open your project folder in the terminal.
2. Run a local server (so the API and JSON work properly):
   ```bash
   python3 -m http.server 8000
   ```
3. Open your browser and go to:
   ```
   http://localhost:8000/index.html
   ```
4. Select a country from the dropdown to see its details.

---

## 🌐 APIs and JSON Used
This project currently uses **2 APIs** and **1 JSON file**:

### APIs
1. **REST Countries API**
   - URL: `https://restcountries.com/v3.1/`
   - Purpose: Loads all countries, names, capitals, population, languages, flags, and coordinates.
   - Used for: Country details and latitude (for “Best Time to Visit”).

2. **Wikipedia API**
   - URL example: `https://en.wikipedia.org/api/rest_v1/page/summary/Japan`
   - Purpose: Gets short travel highlights and food/cuisine info for each country.

### JSON File
1. **countries.json**
   - Location: in the project folder.
   - Purpose: Fallback data when there’s no internet connection.
   - Contains: country names and ISO codes (so the app can still list all countries offline).

---

## 🧠 What the App Does
- Loads every country from the REST Countries API.
- Shows live data: capital, currency, region, population, and languages.
- Displays **“Best Time to Visit”** automatically using latitude (north/south hemisphere).
- Shows **food information** from Wikipedia (for all countries).
- Includes a **travel checklist** that users can edit and reset.
- Works **offline** using the `countries.json` file.

---

## 🧩 For the Backend Developer
The backend will eventually replace these APIs.
Here’s what to prepare:

| Purpose | Current Source | Future Endpoint |
|----------|----------------|----------------|
| Get all countries | REST Countries `/v3.1/all` | `/api/countries` |
| Get country basics | REST Countries `/v3.1/name/{name}` | `/api/countries/:name` |
| Get highlights | Wikipedia summary | `/api/countries/:name/summary` |
| Get cuisine | Wikipedia cuisine pages | `/api/countries/:name/cuisine` |

Each endpoint should return JSON with fields like:
`{ name, capital, currency, region, languages, population, flagUrl, lat, summary, cuisine }`

---

## 📁 Project Structure
```
/project-folder
│
├── index.html
├── destinations.html
├── contact.html
├── styles.css
├── script.js
├── countries.json
└── /images
```

---

## 💡 Notes
- Always run from a local server (not by double-clicking HTML).
- When backend is ready, replace API URLs in `script.js`.
- The app is fully ready for backend integration.





We improved our web app so it can now show information about all countries in the world. The app connects to two APIs and uses one JSON file. The first API is the REST Countries API, which gives live details about every country, such as its name, capital, population, flag, and location. The second API is the Wikipedia API, which provides short highlights and food information for each country. We also added a local file named countries.json, which is used only when the internet or the REST Countries API is not available, so our app can still work offline. Together, these updates allow our app to automatically load every country, show travel tips like “Best Time to Visit” and “Popular Food,” and continue working even without an internet connection.
