// Initialize the map and set its view
var map = L.map('map').setView([45.5236, -122.6750], 13);

// Add a tile layer to the map (this is the base map layer)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Example array of coordinates
var coordinates = [
    { lat: 45.5236, lng: -122.6750, name: 'Location 1', content: 'Custom content for Location 1' },
    { lat: 45.5289, lng: -122.6808, name: 'Location 2', content: 'Custom content for Location 2' }
];

// Iterate over the coordinates array
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
    marker.bindTooltip(coord.name,  { permanent: true }).openTooltip();
});
