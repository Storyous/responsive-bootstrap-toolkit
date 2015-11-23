

var ResponsiveBootstrapToolkit = {

    /**
     * Determines default debouncing interval of 'changed' method
     */
    interval: 300,

    /**
     *
     */
    framework: null,

    /**
     * Breakpoint aliases, listed from smallest to biggest
     */
    breakpoints: null,

    /**
     * Breakpoint detection divs for each framework version
     */
    _detectionDivs: {
        // Bootstrap 3
        bootstrap: {
            'xs': $('<div class="device-xs visible-xs visible-xs-block"></div>'),
            'sm': $('<div class="device-sm visible-sm visible-sm-block"></div>'),
            'md': $('<div class="device-md visible-md visible-md-block"></div>'),
            'lg': $('<div class="device-lg visible-lg visible-lg-block"></div>')
        },
        // Foundation 5
        foundation: {
            'small':  $('<div class="device-xs show-for-small-only"></div>'),
            'medium': $('<div class="device-sm show-for-medium-only"></div>'),
            'large':  $('<div class="device-md show-for-large-only"></div>'),
            'xlarge': $('<div class="device-lg show-for-xlarge-only"></div>')
        }
    },


    init: function( env ) {

       $('<div class="responsive-bootstrap-toolkit"></div>').appendTo('body');

        this.use('bootstrap');

        if ( env.toLowerCase() !== 'production' ) {
            this._addToolkitBar();
        }
    },


    /**
     * Returns true if current breakpoint matches passed alias
     */
    is: function( str ) {

        if( this._isAnExpression( str ) ) {
            return this._isMatchingExpression( str );
        }
        return this.breakpoints[ str ] && this.breakpoints[ str ].is(':visible');
    },

    /**
     * Determines which framework-specific breakpoint detection divs to use
     */
    use: function( frameworkName, breakpoints ) {
        this.framework = frameworkName.toLowerCase();

        if( this.framework === 'bootstrap' || this.framework === 'foundation') {
            this.breakpoints = this._detectionDivs[ this.framework ];
        } else {
            this.breakpoints = breakpoints;
        }

        this._applyDetectionDivs();
    },

    /**
     * Returns current breakpoint alias
     */
    current: function(){

        var self = this;

        var name = 'unrecognized';
        $.each(this.breakpoints, function(alias){
            if (self.is(alias)) {
                name = alias;
            }
        });
        return name;
    },

    /*
     * Waits specified number of miliseconds before executing a callback
     */
    changed: function(fn, ms) {
        var self = this;
        var timer;

        return function(){
            clearTimeout(timer);
            timer = setTimeout(function(){
                fn();
            }, ms || self.interval);
        };
    },

    _windowSize: function() {
        return '<span style="text-transform: lowercase;margin-right:5px">' + $(window).width() + ' px </span>';
    },

    _toolkitDataHtml: function() {
        return this._windowSize() + '( ' + this.current() + ' )' ;
    },

    _addToolkitBar : function() {

        var self = this;
        var $toolkitBar = $('<div class="responsive-bootstrap-toolkit-bar">'+ this._toolkitDataHtml() + '</div>');

        var styles = {
            'position': 'absolute',
            'left': 0,
            'top': 0,
            'display': 'block',
            'padding':'5px 15px',
            'background-color': 'rgba(0,0,0,0.6)',
            'z-index': '99999',
            'color': '#fff',
            'text-align': 'center',
            'font-size': '11px',
            'text-transform': 'uppercase',
        }

        $toolkitBar.appendTo('body').css(styles);

        $(window).resize(function(){
            $toolkitBar.html( self._toolkitDataHtml() );
        });
    },

    /**
     * Append visibility divs after DOM laoded
     */
    _applyDetectionDivs: function() {
        var self = this;

        $.each(this.breakpoints, function(alias){
            self.breakpoints[alias].appendTo('.responsive-bootstrap-toolkit');
        });

    },

    /**
     * Determines whether passed string is a parsable expression
     */
    _isAnExpression: function( str ) {
        return (str.charAt(0) == '<' || str.charAt(0) == '>');
    },

    /**
     * Splits the expression in into <|> [=] alias
     */
    _splitExpression: function( str ) {

        // Used operator
        var operator = str.charAt(0);
        // Include breakpoint equal to alias?
        var orEqual  = (str.charAt(1) == '=') ? true : false;

        /**
         * Index at which breakpoint name starts.
         *
         * For:  >sm, index = 1
         * For: >=sm, index = 2
         */
        var index = 1 + (orEqual ? 1 : 0);

        /**
         * The remaining part of the expression, after the operator, will be treated as the
         * breakpoint name to compare with
         */
        var breakpointName = str.slice(index);

        return {
            operator:       operator,
            orEqual:        orEqual,
            breakpointName: breakpointName
        };
    },

    /**
     * Returns true if currently active breakpoint matches the expression
     */
    _isAnyActive: function( breakpoints ) {
        var self = this;
        var found = false;

        $.each(breakpoints, function( index, alias ) {
            // Once first breakpoint matches, return true and break out of the loop
            if( self.breakpoints[ alias ].is(':visible') ) {
                found = true;
                return false;
            }
        });
        return found;
    },

    /**
     * Determines whether current breakpoint matches the expression given
     */
    _isMatchingExpression: function( str ) {

        var expression = this._splitExpression( str );

        // Get names of all breakpoints
        var breakpointList = Object.keys(this.breakpoints);

        // Get index of sought breakpoint in the list
        var pos = breakpointList.indexOf( expression.breakpointName );

        // Breakpoint found
        if( pos !== -1 ) {

            var start = 0;
            var end   = 0;

            /**
             * Parsing viewport.is('<=md') we interate from smallest breakpoint ('xs') and end
             * at 'md' breakpoint, indicated in the expression,
             * That makes: start = 0, end = 2 (index of 'md' breakpoint)
             *
             * Parsing viewport.is('<md') we start at index 'xs' breakpoint, and end at
             * 'sm' breakpoint, one before 'md'.
             * Which makes: start = 0, end = 1
             */
            if( expression.operator == '<' ) {
                start = 0;
                end   = expression.orEqual ? ++pos : pos;
            }
            /**
             * Parsing viewport.is('>=sm') we interate from breakpoint 'sm' and end at the end
             * of breakpoint list.
             * That makes: start = 1, end = undefined
             *
             * Parsing viewport.is('>sm') we start at breakpoint 'md' and end at the end of
             * breakpoint list.
             * Which makes: start = 2, end = undefined
             */
            if( expression.operator == '>' ) {
                start = expression.orEqual ? pos : ++pos;
                end   = undefined;
            }

            var acceptedBreakpoints = breakpointList.slice(start, end);

            return this._isAnyActive( acceptedBreakpoints );
        }
    }

}

module.exports = ResponsiveBootstrapToolkit;
