var UI = require('ui');
var ajax = require('ajax');
var Vibe = require('ui/vibe');
var Settings = require('settings');

// Set a configurable with just the close callback
Settings.config(
  { url: 'http://www.davidenastri.it/nextbus/' },
  function(e) {
    console.log('closed configurable');

    // Show the parsed response
    console.log(JSON.stringify(e.options));

    // Show the raw response if parsing failed
    if (e.failed) {
      console.log(e.response);
    }
  }
);


var resultCard = new UI.Card({
    //title: destinations[event.itemIndex].title,
    //body: destinations[event.itemIndex].subtitle
});

function showResultCard(coordinates, event) {


    if (destinations[event.itemIndex].title == 'Home') {
        resultCard.title('Home');
        var chosenDeparture = 'aalsmeer/bushalte-dorpsstraat';
        var chosenDestination = 'Haarlem Station';
        var APIURL = 'https://api.9292.nl/0.1/locations/' + chosenDeparture + '/departure-times?lang=en-GB';
    } else {
        resultCard.title('Work');
        var chosenDeparture = 'haarlem/bushalte-raaksbrug';
        var chosenDestination = 'Uithoorn Busstation';
        var APIURL = 'https://api.9292.nl/0.1/locations/' + chosenDeparture + '/departure-times?lang=en-GB';
    }

    nextBus(APIURL, chosenDestination);

    resultCard.show();
}

function nextBus(APIURL, chosenDestination) {
    resultCard.subtitle('Loading...');
    resultCard.body('');
    ajax({
            url: APIURL,
            type: 'json'
        },
        function(data) {

            var departures = data.tabs[0].departures;
            var i = 0;
            for (i = 0; i < departures.length; i++) {
                if (departures[i].destinationName == chosenDestination) {
                    var time = departures[i].time;
                    var destination = departures[i].destinationName;
                    resultCard.subtitle(time);
                    var delay = '';
                    if (departures[i].realtimeText) {
                        delay = departures[i].realtimeText;
                    }
                    resultCard.body(destination + '\n' + delay);
                    Vibe.vibrate('short');
                    break;
                }
            }

        },
        function(error) {
            // Failure!
            console.log('Failed fetching bus data: ' + error);
        }
    );



}

var splashScreen = new UI.Card({
    banner: 'images/splash.png'
});
splashScreen.show();

// Make a list of menu items
var destinations = [{
    title: "Home",
    subtitle: "Home sweet home"
}, {
    title: "Work",
    subtitle: "It's off to work we go"
}];

// Create the Menu, supplying the list of destinations
var destinationsMenu = new UI.Menu({
    sections: [{
        title: 'Choose a destination',
        items: destinations
    }]
});

setTimeout(function() {
    // Display the mainScreen
    // Show the Menu
    destinationsMenu.show();
    // Hide the splashScreen to avoid showing it when the user press Back.
    splashScreen.hide();
}, 400);

// Add a click listener for select button click
destinationsMenu.on('select', function(event) {
    // Geolocation
    var locationOptions = {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000
    };

    function locationSuccess(pos) {
        console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
        showResultCard(pos.coords.latitude + ',' + pos.coords.longitude, event);
    }

    function locationError(err) {
        console.log('location error (' + err.code + '): ' + err.message);
    }

    navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
});