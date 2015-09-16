    var ui = require('ui');
    var ajax = require('ajax');
    var vibe = require('ui/vibe');
    var settings = require('settings');
    var resultCard = new ui.Card();



    var trip = {
        destinations: [{
            title: "Home",
            subtitle: "Home sweet home"
        }, {
            title: "Work",
            subtitle: "It's off to work we go"
        }],
        configureSettings: function() {
            settings.config({
                    url: 'http://www.davidenastri.it/nextbus/'
                },
                function(e) {
                    console.log('closed configurable');
                    console.log(JSON.stringify(e.options));
                    if (e.failed) {
                        console.log(e.response);
                    }
                }
            );
        },
        showResultCard: function(coordinates, event) {
            if (trip.destinations[event.itemIndex].title == 'Home') {
                resultCard.title('Home');
                var chosenDeparture = 'aalsmeer/bushalte-dorpsstraat';
                var chosenDestination = 'Haarlem Station';
                var APIURL = 'https://api.9292.nl/0.1/locations/' + chosenDeparture + '/departure-times?lang=en-GB';
            } else {
                resultCard.title('Work');
                resultCard.icon('images/bus.png');
                var chosenDeparture = 'haarlem/bushalte-raaksbrug';
                var chosenDestination = 'Uithoorn Busstation';
                var APIURL = 'https://api.9292.nl/0.1/locations/' + chosenDeparture + '/departure-times?lang=en-GB';
            }
            trip.nextBus(APIURL, chosenDestination);
            resultCard.show();
        },
        getLocation: function(event) {
            var locationOptions = {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 10000
            };

            function locationSuccess(pos) {
                console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
                trip.showResultCard(pos.coords.latitude + ',' + pos.coords.longitude, event);
            }

            function locationError(err) {
                console.log('location error (' + err.code + '): ' + err.message);
            }
            navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
        },
        nextBus: function(APIURL, chosenDestination) {
            resultCard.subtitle('Loading...');
            resultCard.body('Please wait');
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
                            vibe.vibrate('short');
                            break;
                        }
                    }
                },
                function(error) {
                    console.log('Failed fetching bus data: ' + error);
                }
            );
        }


    };




    var destinationsMenu = new ui.Menu({
        sections: [{
            title: 'Choose a destination',
            items: trip.destinations
        }]
    });



    destinationsMenu.on('select', function(event) {
        if (1 > 3) {
            //geolocation(event) ;
        } else {
            trip.showResultCard('0,0', event);
        }
    });

    destinationsMenu.show();