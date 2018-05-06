;(function(App, undefined) {
    App.Components = (App.Components || {});
    "use strict";

    App.Components.KeyboardControlHandler = function () {
        this.public = {};

        this.cbFns = [];

        this.__construct = function() {
            this.__setupHandlers();
        }

        this.__setupHandlers = function() {
            $(document).keypress(function( e ) {
                for(var i = 0; i < this.cbFns.length; i++) {
                    this.cbFns[i](e);
                }
            }.bind(this));
        }.bind(this);

        this.public.addOnKeyPressCb = function(cbFn) {
            this.cbFns.push(cbFn);
        }.bind(this);

        this.__construct();
        return this.public;
    };
})(window.App = window.App || {});
