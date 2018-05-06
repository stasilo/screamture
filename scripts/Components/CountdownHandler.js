;(function(App, undefined) {
    App.Components = (App.Components || {});
    "use strict";

    App.Components.CountdownHandler = function () {
        this.public = {};

        this.$countContainer = $('.countdown__wrapper');
        this.$countCopyEl = $('.countdown__copy');

        this.count = 0;
        this.counter = null;

        this.__construct = function() {
        }

        this.public.countdownActive = function() {
            return this.counter != null;
        }.bind(this);

        this.public.startCountdown = function(initialDelay, duration, onCompleteCb) {
            initialDelay = initialDelay || 0;

            setTimeout(function() {
                this.count = duration/1000;
                this.$countCopyEl.text(this.count);
                this.$countContainer.show();

                $(document).trigger('stasilo.animation-paused');

                this.counter = setInterval(function() {
                    this.count -= 1;

                    if(this.count <= -1) {
                        clearInterval(this.counter);
                        this.counter = null;
                        this.$countContainer.fadeOut(400);

                        $(document).trigger('stasilo.animation-resumed');

                        onCompleteCb();

                        return;
                    } else {
                        if(this.count == 0) {
                            this.$countCopyEl.text('Noise!');
                        } else {
                            this.$countCopyEl.text(this.count);
                        }
                    }
                }.bind(this), 650);
            }.bind(this), initialDelay);
        }.bind(this);

        this.__construct();
        return this.public;
    };
})(window.App = window.App || {});
