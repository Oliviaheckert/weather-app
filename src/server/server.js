const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const DEFAULT_PORT = 3000;
const PORT = process.env.PORT || DEFAULT_PORT;

function startServer(port) {
    const server = app.listen(port, () => {
        console.log(`🚀 Server successfully started on port ${port}`);
        console.log(`Access the app at: http://localhost:${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`⚠️ Port ${port} is busy. Trying another port...`);
            startServer(port + 1);
        } else {
            console.error('Server startup error:', err);
        }
    });

    return server;
}

// Middleware
app.use(cors());

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client'), {
    extensions: ['html']
}));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// API Key Endpoint
app.get('/api/weather-key', (req, res) => {
    res.json({ 
        token: process.env.WEATHER_API_KEY 
    });
});

// Proxy route for geocoding
app.get('/api/geocode', async (req, res) => {
    const { city } = req.query;

    try {
        const apiKey = process.env.WEATHER_API_KEY;
        const geocodeURL = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`;

        const fetch = await import('node-fetch');
        const response = await fetch.default(geocodeURL);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        console.error("Geocoding API Error:", error);
        res.status(500).json({ 
            error: 'Failed to fetch location data',
            details: error.message
        });
    }
});

// Proxy route for weather API
app.get('/api/weather', async (req, res) => {
    const { lat, lon } = req.query;
    
    try {
        const apiKey = process.env.WEATHER_API_KEY;
        const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        
        const fetch = await import("node-fetch");
        const response = await fetch.default(weatherURL);
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        console.error("Weather API Error:", error);
        res.status(500).json({ 
            error: "Failed to fetch weather data",
            details: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// Start the server
startServer(PORT);