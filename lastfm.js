/**
 * Created by Robson on 1/17/17.
 */





Module.register("lastfm",{
    // Default module config.
    defaults: {
        apikey: "",
        animationSpeed: 1000,
        retryDelay: 2500,
        updateInterval: 10 * 60 * 1000,
    },

    start: function() {
        Log.info("Starting module: " + this.name);

        // Set locale.
        //moment.locale(config.language);

        this.song = null;
        this.loaded = false;
        this.scheduleUpdate(this.config.initialLoadDelay);

        this.updateTimer = null;

    },

    // Override dom generator.
    getDom: function() {
        var wrapper = document.createElement("div");
        wrapper.innerHTML = this.songs[0].artist.text;
        return wrapper;
    },

    updateSong: function() {
        if (this.config.apikey === "") {
            Log.error("lastfm: apikey not set!");
            return;
        }

        var url = "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=rj&api_key=cd16a177cde26466eafa65f4353341a9&format=json";
        var self = this;
        var retry = true;

        // readystate === 4 indicates done loading in ajax.js
        var fmRequest = new XMLHttpRequest();
        fmRequest.open("GET", url, true);

        fmRequest.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {

                    //var songs = JSON.parse(this.response);
                    self.processSong(JSON.parse(this.response));
                } else if (this.status === 401) {
                    self.updateDom(self.config.animationSpeed);

                    Log.error(self.name + ": Incorrect apikey.");
                    retry = true;
                } else {
                    Log.error(self.name + ": Could not load song.");
                }


                if (retry) {
                    self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
                }
            }
        };
        fmRequest.send();
    },

    /* processWeather(data)
     * Uses the received data to set the various values.
     *
     * argument data object - Weather information received form openweather.org.
     */
    processSong: function(data) {
        //this.fetchedLocatioName = data.city.name + ", " + data.city.country;

        //this.song = [];
        //for (var i = 0, count = data.list.length; i < count; i++) {

            this.song = data.recenttracks[0];
            // this.forecast.push({
            //
            //     day: moment(forecast.dt, "X").format("ddd"),
            //     icon: this.config.iconTable[forecast.weather[0].icon],
            //     maxTemp: this.roundValue(forecast.temp.max),
            //     minTemp: this.roundValue(forecast.temp.min),
            //     rain: this.roundValue(forecast.rain)
            //
            // });
       // }

        //Log.log(this.forecast);
        this.show(this.config.animationSpeed, {lockString:this.identifier});
        this.loaded = true;
        this.updateDom(this.config.animationSpeed);
    },

    /* scheduleUpdate()
     * Schedule next update.
     *
     * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
     */
    scheduleUpdate: function(delay) {
        var nextLoad = this.config.updateInterval;
        if (typeof delay !== "undefined" && delay >= 0) {
            nextLoad = delay;
        }

        var self = this;
        clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(function() {
            self.updateWeather();
        }, nextLoad);
    },


});



