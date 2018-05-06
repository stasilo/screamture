;(function(App, undefined) {
    App.Components = (App.Components || {});
    "use strict";

    App.Components.ButtonHandler = function(options) {
        this.public = {};

        this.recordButtonAttr = 'data-stasilo-record';
        this.exportButtonAttr = 'data-stasilo-export';

        this.__construct = function(options) {
            this.recordButtonCb = options.recordButtonCb;
            this.exportButtonCb = options.exportButtonCb;

            this.__setupHandlers();
        }

        this.__setupHandlers = function() {
            $(document).on('click', '[' + this.recordButtonAttr + ']', function(e) {
                e.stopPropagation();
                e.preventDefault();
                this.recordButtonCb();
            }.bind(this));

            $(document).on('click', '[' + this.exportButtonAttr + ']', function(e) {
                e.stopPropagation();
                e.preventDefault();
                this.exportButtonCb();
            }.bind(this));
        }.bind(this);

        this.__construct(options);
        return this.public;
    };
})(window.App = window.App || {});
