;(function(App, undefined) {
    App.Components = (App.Components || {});
    "use strict";

    App.Components.SoundAnalyzer = function () {
        this.public = {};

        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

        this.context = null;
        this.filter = null;
        this.microphone = null;
        this.analyzer = null;

        this.__construct = function() {
            this.context = new AudioContext();

            navigator.getUserMedia({audio: true}, function(stream) {
                this.microphone = this.context.createMediaStreamSource(stream);
                this.__setupNodes();
            }.bind(this), function(error) {
                console.dir(error);
                alert("Error!");
            });
        }

        this.__setupNodes = function() {
            this.analyzer = this.context.createAnalyser();

            this.analyzer.fftSize = 1024; // gives 1024 / 2 = 512 data points per sample of sound
            this.analyzer.smoothingTimeConstant = 0.2; //0.2;

            this.microphone.connect(this.analyzer);
            this.analyzer.connect(this.context.destination);
        }.bind(this);

        //public
        this.public.resumeContext = function() {
            this.context.resume(); 
        }.bind(this);

        this.public.getFrequencyData = function() {
            if(this.analyzer == null) {
                return;
            }

            var frequencyData = new Uint8Array(this.analyzer.frequencyBinCount);
            this.analyzer.getByteFrequencyData(frequencyData);
            // this.analyzer.getByteTimeDomainData(frequencyData);

            return frequencyData;
        }.bind(this);

        this.public.getFrequencyDataAtIndex = function(index) {
            var frequencyData = this.public.getFrequencyData();
            return frequencyData[index];
        }.bind(this);

        this.__construct();
        return this.public;
    };
})(window.App = window.App || {});
