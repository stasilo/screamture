;(function(App, undefined) {
    App.Components = (App.Components || {});
    "use strict";

    App.Components.ModalHandler = function(options) {
        this.public = {};

        this.$modalContainer = $('.modal__wrapper');
        this.closeButtonAttr = 'data-stasilo-close';

        this.onCloseCb = null;

        this.__construct = function(options) {
            this.onCloseCb = options.onCloseCb;
            this.__setupHandlers();
        }

        this.__setupHandlers = function() {
            $(document).on('click', '[' + this.closeButtonAttr + ']', function(e) {
                e.stopPropagation();
                e.preventDefault();

                this.$modalContainer.hide();
                this.onCloseCb();
            }.bind(this));
        }.bind(this);

        this.__construct(options);
        return this.public;
    };
})(window.App = window.App || {});
