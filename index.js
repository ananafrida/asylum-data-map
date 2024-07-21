// Initialize the map and set its view
var map = L.map('map').setView([45.5236, -122.6750], 13);

// Add a tile layer to the map (this is the base map layer)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to read the Excel file and parse coordinates
function readExcel(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Convert the Excel data to an array of coordinate objects
        const coordinates = jsonData.slice(1).map(row => ({
            lat: parseFloat(row[0]),
            lng: parseFloat(row[1]),
            name: row[2] || '',
            content: row[3] || ''
        }));

        // Add markers to the map
        addMarkers(coordinates);
    };
    reader.readAsArrayBuffer(file);
}

// Function to process the JSON data and parse coordinates
function processExcelData(data) {
    // Convert the JSON data to an array of coordinate objects
    const coordinates = data.values.slice(1).map(row => ({
        lat: parseFloat(row[0]),
        lng: parseFloat(row[1]),
        name: row[2] || '',
        content: row[3] || ''
    }));

    // Add markers to the map
    addMarkers(coordinates);
}

// Function to add markers to the map
function addMarkers(coordinates) {
    coordinates.forEach(function(coord) {
        // Create marker for each coordinate
        var marker = L.marker([coord.lat, coord.lng]).addTo(map);

        // Create custom popup for each marker
        var popup = L.popup({
            maxWidth: 300,
            offset: [0, -30]
        }).setContent('<p><b>' + coord.name + '</b><br>' + coord.content + '</p>');

        // Bind popup to marker
        marker.bindPopup(popup);

        // Bind tooltips to the markers and keep open by default
        marker.bindTooltip(coord.name, { permanent: false }).openTooltip();
    });
}

// Example URL of the file on the server
const sheetId = '19yWw6In34cPDGKoLWDVD-RUPNVxAHEAfneaNAu4JFFQ';
const apiKey = 'AIzaSyAImcEAwF7fePnN0kJN8nCM--LX2ZMzkPo';
const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;

if (url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            processExcelData(data);
        })
        .catch(error => {
            console.error('Error fetching the file:', error);
        });
}
