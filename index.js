// Initialize the map and set its view to the US
var map = L.map('map').setView([37.0902, -95.7129], 5);

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
        const coordinates = jsonData.slice(1).map(row => {
            if (row[0]) {
                const [lat, lng] = row[0].split(',').map(parseFloat);
                return {
                    lat,
                    lng,
                    name: row[1] || '',
                    content: row[2] || '',
                    image: row[3] || '', // Assuming the image URL is in the fourth column
                    additionalData: row.slice(4, 17).map((col, index) => ({
                        title: jsonData[0][index + 4] || `Column ${index + 5}`,
                        value: col || ''
                    })),
                    otherNotes: row[17] || '', // Handling the 18th column separately
                    otherNotesTitle: jsonData[0][17] || 'Other Notes' // Parsing the 18th column's name
                };
            }
            return null;
        }).filter(coord => coord !== null);

        // Add markers to the map
        addMarkers(coordinates);
    };
    reader.readAsArrayBuffer(file);
}

// Function to process the JSON data and parse coordinates
function processExcelData(data) {
    // Convert the JSON data to an array of coordinate objects
    const coordinates = data.values.slice(1).map(row => {
        if (row[0]) {
            const [lat, lng] = row[0].split(',').map(parseFloat);
            return {
                lat,
                lng,
                name: row[1] || '',
                content: row[2] || '',
                image: row[3] || '', // Assuming the image URL is in the fourth column
                additionalData: row.slice(4, 17).map((col, index) => ({
                    title: data.values[0][index + 4] || `Column ${index + 5}`,
                    value: col || ''
                })),
                otherNotes: row[17] || '', // Handling the 18th column separately
                otherNotesTitle: data.values[0][17] || 'Other Notes' // Parsing the 18th column's name
            };
        }
        return null;
    }).filter(coord => coord !== null);

    // Add markers to the map
    addMarkers(coordinates);
}

// Function to add markers to the map
function addMarkers(coordinates) {
    coordinates.forEach(function(coord) {
        // Create marker for each coordinate
        var marker = L.marker([coord.lat, coord.lng]).addTo(map);

        // Create custom popup content with image and styles for scroll bar
        var popupContent = '<div style="max-height:200px;overflow-y:auto;">' +
            '<p><b>' + coord.name + '</b><br>' + coord.content + '</p>';
        if (coord.image) {
            popupContent += '<img src="' + coord.image + '" alt="' + coord.name + '" style="max-width:100%;height:auto;">';
        }
        coord.additionalData.forEach(data => {
            popupContent += '<p><b>' + data.title + ':</b> ' + data.value + '</p>';
        });

        // Check if otherNotes is a URL or plain text
        if (coord.otherNotes) {
            const isUrl = /^https?:\/\//.test(coord.otherNotes);
            popupContent += '<p><b>' + coord.otherNotesTitle + ':</b> ' + 
                (isUrl ? '<a href="' + coord.otherNotes + '" target="_blank">' + coord.otherNotes + '</a>' : coord.otherNotes) + 
                '</p>';
        }

        popupContent += '</div>'; // Close the div with styles

        var popup = L.popup({
            maxWidth: 400,
            offset: [0, -30]
        }).setContent(popupContent);

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
