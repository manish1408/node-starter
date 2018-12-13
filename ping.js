const Ping = require('ping-monitor');
module.exports.pingWebsite = function (websites, intervalInSeconds) {
    websites.forEach(function (website) {
        if(website=='') return;
        let monitor = new Ping({
            website: 'https://'+website,
            interval: (intervalInSeconds>0)?(intervalInSeconds/60):1
        });
        

        monitor.on('up', function (res) {
            console.log('Yay!! ' + res.website + ' is up.');
            console.log(res);
        });

        monitor.on('down', function (res) {
            console.log('Oh Snap!! ' + res.website + ' is down! ' + res.statusMessage);
            console.log(res);
        });


        monitor.on('stop', function (website) {
            console.log(website + ' monitor has stopped.');
        });

    });

}