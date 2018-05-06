;(function(App, undefined) {
    App.Components = (App.Components || {});
    "use strict";

    App.Components.ProgressbarHandler = function () {
        this.public = {};

        this.finished = false;

        this.$progressEl = $('.progressbar__statusbar');
        this.$doneMsgEl = $('.progressbar__notice');

        this.$controlsContainer = $('.controls__wrapper');

        this.__construct = function() {
        }

        this.public.setProgress = function(percentage) {
            if(percentage >= 1 && !this.finished) {
                this.finished = true;
                $(document).trigger('stasilo.animation-paused');
                this.public.hide();

                return;
            } else if(percentage == 0) {
                this.finished = false;
                this.$progressEl.show();
            }

            this.$progressEl.css('width', (percentage * 100) + '%');
        }.bind(this);

        this.public.hide = function() {
            this.$progressEl.fadeOut();
            this.$doneMsgEl.show();
            this.$progressEl.css('width', '0');

            setTimeout(function() {
                this.$doneMsgEl.fadeOut();
                this.$controlsContainer.show();

                $(document).trigger('stasilo.animation-resumed');
                $(document).trigger('stasilo.fade-in-cube');

            }.bind(this), 800);

        }.bind(this);

        this.__construct();
        return this.public;
    };
})(window.App = window.App || {});
