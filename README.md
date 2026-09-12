                                                                                                                    # GrowFit 🌱

**Track small improvements consistently.**

GrowFit is a modern, mobile-first fitness and healthy weight-gain tracking app. It focuses on personal progress — not extreme dieting, bodybuilding competition prep, or unhealthy body standards.

## Features

- 📊 Dashboard with daily overview
- 🏋️ Exercise tracking with beginner-friendly library
- 🍽️ Nutrition tracking with common Indian foods
- 📈 Progress charts and personal records
- 📝 Daily journal for mood, energy, and sleep
- 📱 Works on mobile, tablet, and desktop
- 🌙 Beautiful dark theme

## Tech Stack

**Current (v1 — Frontend only):**
- HTML, CSS, vanilla JavaScript
- localStorage for data persistence

**Planned:**
- Node.js + Express.js backend
- MongoDB database
- PWA support (installable on Android)
- User authentication

## Getting Started

1. Clone this repository
2. Open `index.html` in your browser
3. That's it! No build tools or server needed for v1.

## Project Structure

```
GrowFit/
├── index.html          ← Main app
├── css/
│   └── style.css       ← Design system
├── js/
│   ├── storage.js      ← Data layer (localStorage)
│   ├── app.js          ← Navigation & utilities
│   ├── dashboard.js    ← Dashboard page
│   ├── exercise.js     ← Exercise tracker
│   ├── nutrition.js    ← Nutrition tracker
│   ├── progress.js     ← Progress & charts
│   └── more.js         ← Settings
└── README.md
```

## Roadmap

- [x] Stage 1: Dashboard UI
- [x] Stage 2: Navigation & page sections
- [x] Stage 3: Exercise tracking
- [ ] Stage 4: Nutrition tracking
- [ ] Stage 5: Progress charts
- [x] Stage 6: Journal
- [ ] Stage 7: Full localStorage persistence
- [ ] Stage 8: PWA conversion
- [ ] Stage 9: Node.js + Express backend
- [ ] Stage 10: MongoDB
- [ ] Stage 11: Authentication
- [ ] Stage 12: Polish & accessibility

## Disclaimer

GrowFit is a personal tracking tool. Nutrition values are approximate. This app does not provide medical advice. Consult a healthcare professional before making significant changes to your diet or exercise routine.

## License

MIT
