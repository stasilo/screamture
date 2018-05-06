;(function(App, undefined) {
    App.Components = (App.Components || {});
    "use strict";

    App.Components.FrequencyRecorder = function () {
        this.public = {};

        //70 buckets => approximately 2 seconds of audio
        var MAX_NO_OF_BUCKETS = 320;

        this.frequencyBuckets = [];
        this.finalFreqData = Array.apply(null, Array(1000)).map(Number.prototype.valueOf,0);

        this.recording = false;
        this.hasRecorded = false;
        this.startRecordTime = 0;
        this.totalNoDataPoints = 0;
        this.completedPercentage = 0;

        this.__construct = function(options) {
            this.soundAnalyzer = new App.Components.SoundAnalyzer();
        }

        this.__updateFrequencyHistory = function() {
            var newFreqHistory = [];

            for(var i = 0; i < this.frequencyBuckets.length; i++) {
                var newFreqBucket = [];

                // var step = Math.floor(this.frequencyBuckets[i].length / this.finalBucketSize);
                var step = Math.floor(this.frequencyBuckets[i].length / this.finalBucketSize);

                for(var b = 0; b < this.finalBucketSize; b++) {
                    var bucketFreqSum = 0;

                    for(var j = b * step, c = 0; c < step; c++) {
                        bucketFreqSum += this.frequencyBuckets[i][j + c];
                    }

                    bucketFreqSum = bucketFreqSum / step;
                    newFreqBucket.push(bucketFreqSum);
                }

                newFreqHistory.push(newFreqBucket);
            }

            var mergedFreqHistory = [].concat.apply([], newFreqHistory);

            this.completedPercentage = mergedFreqHistory.length/this.totalNoDataPoints;

            this.finalFreqData = [];
            for(var i = 0; i < this.totalNoDataPoints; i++) {
                this.finalFreqData.push(typeof mergedFreqHistory[i] !== 'undefined' ? mergedFreqHistory[i] : 0);
            }
        }.bind(this);

        //public
        this.public.setNoOfDataPoints = function(noOfPoints) {
            this.totalNoDataPoints = noOfPoints;

            // this.finalBucketSize = Math.floor(this.totalNoDataPoints / MAX_NO_OF_BUCKETS);
            this.finalBucketSize = Math.ceil(this.totalNoDataPoints / MAX_NO_OF_BUCKETS);
            this.finalFreqData = Array.apply(null, Array(this.totalNoDataPoints)).map(Number.prototype.valueOf, 0);

            console.log("\n\nFinal bucket size is: " + this.finalBucketSize);
        }.bind(this);

        this.public.update = function() {
            var currentTime = Date.now();

            if(!this.recording) {
                return;
            }

            var freqData = this.soundAnalyzer.getFrequencyData();
            this.frequencyBuckets.push(freqData);
            this.__updateFrequencyHistory();

            if(this.completedPercentage >= 1) {
                setTimeout(function() {
                    this.recording = false;

                }.bind(this), 1100);

                console.dir(this.finalFreqData);
            }
        }.bind(this);

        this.public.isRecording = function() {
            return this.recording;
        }.bind(this);

        this.public.hasRecorded = function() {
            return this.hasRecorded;
        }.bind(this);

        this.public.startRecording = function() {
            console.log("STARTING RECORDING!");

            this.soundAnalyzer.resumeContext();

            this.startRecordTime = Date.now();
            this.frequencyBuckets = [];
            this.finalFreqData = [];
            this.recording = true;
            this.hasRecorded = true;

            this.completedPercentage = 0;
        }.bind(this);

        this.public.getCurrentFrequencyHistory = function(index, factor) {
            factor = factor || 0.6;
            return this.finalFreqData[index]*factor;
        }.bind(this);

        this.public.getCompletedPercentage = function() {
            return this.completedPercentage;
        }.bind(this);

        this.__construct();
        return this.public;
    };
})(window.App = window.App || {});
