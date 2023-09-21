var map = L.map('map', {
    center: [0, 0],
    zoom: 2,
});

var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://carto.com/attributions">CARTO</a> contributors',
});

var satelliteLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a> contributors',
});

var earthquakeDataUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

function getColor(depth) {
    var colors = ['#00FF00', '#4CAF50', '#FFA500', '#FFD700', '#FF4500', '#8B0000'];
    var depthRanges = [-10, 10, 30, 50, 70, 90];
    var color = colors[colors.length - 1];

    if (depth >= 90) {
        return colors[5];
    }

    for (var i = 0; i < depthRanges.length - 1; i++) {
        if (depth >= depthRanges[i] && depth < depthRanges[i + 1]) {
            color = colors[i];
            break;
        }
    }

    return color;
}

function getSize(magnitude) {
    var baseSize = 5;
    var scaledSize = magnitude * 2;

    if (scaledSize < baseSize) {
        scaledSize = baseSize;
    } else if (scaledSize > 20) {
        scaledSize = 20;
    }

    return scaledSize;
}

var earthquakeLayer = L.layerGroup();

var tectonicPlatesLayer = L.geoJSON();

fetch(earthquakeDataUrl)
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                var depth = feature.geometry.coordinates[2];
                var magnitude = feature.properties.mag;
                var color = getColor(depth);
                var size = getSize(magnitude);

                return L.circleMarker(latlng, {
                    radius: size,
                    fillColor: color,
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                }).bindPopup("Magnitude: " + magnitude + "<br>Depth: " + depth);
            }
        }).addTo(earthquakeLayer);
    });

fetch(tectonicPlatesUrl)
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data).addTo(tectonicPlatesLayer);
    });


var baseMaps = {
    "OpenStreetMap": osmLayer,
    "Dark Map": darkLayer,
    "Satellite": satelliteLayer
};


var overlayMaps = {
    "Earthquakes": earthquakeLayer,
    "Tectonic Plates": tectonicPlatesLayer
};

L.control.layers(baseMaps, overlayMaps).addTo(map);

