# Responsive Bootstrap Toolkit

Responsive Bootstrap Toolkit provides an easy way of breakpoint detection in JavaScript, detecting changes in currently active breakpoint, as well as executing any breakpoint-specific JavaScript code. Despite the name, you can use it also with Foundation, or any other framework.

Current version: **2.5.1**

### Documentation
* [Installation](#installation)
* [Demo](#demo)
* [Basic usage](#basic-usage)
* [Execute code on window resize](#execute-code-on-window-resize)
* [Get alias of current breakpoint](#get-alias-of-current-breakpoint)
* [Using with Foundation](#using-with-foundation)
* [Providing your own visibility classes](#providing-your-own-visibility-classes)




#### Basic usage:

````javascript
// Wrap IIFE around your code
(function($, viewport){
    $(document).ready(function() {

        // Executes only in XS breakpoint
        if(viewport.is('xs')) {
            // ...
        }

        // Executes in SM, MD and LG breakpoints
        if(viewport.is('>=sm')) {
            // ...
        }

        // Executes in XS and SM breakpoints
        if(viewport.is('<md')) {
            // ...
        }

        // Execute code each time window size changes
        $(window).resize(
            viewport.changed(function() {
                if(viewport.is('xs')) {
                    // ...
                }
            })
        );
    });
})(jQuery, ResponsiveBootstrapToolkit);
````

#### Execute code on window resize
Allows using custom debounce interval. The default one is set at 300ms.

````javascript
$(window).resize(
    viewport.changed(function() {

      // ...

    }, 150)
);
````

#### Get alias of current breakpoint
````javascript
$(window).resize(
    viewport.changed(function() {
        console.log('Current breakpoint: ', viewport.current());
    })
);
````

#### Using with Foundation

Instead of Bootstrap's aliases `xs`, `sm`, `md` and `lg`, Foundation uses: `small`, `medium`, `large`, and `xlarge`.

````javascript
(function($, viewport){

    viewport.use('Foundation');

    if(viewport.is('small')) {
        // ...
    }

})(jQuery, ResponsiveBootstrapToolkit);
````

**Note:**
Currently, only Foundation 5 visibility classes are supported. If you'd like to support older version of any framework, or provide your own visibility classes, refer to example below.

#### Providing your own visibility classes

````javascript
(function($, viewport){

    var visibilityDivs = {
        'alias-1': $('<div class="device-alias-1 your-visibility-class-1"></div>'),
        'alias-2': $('<div class="device-alias-2 your-visibility-class-2"></div>'),
        'alias-3': $('<div class="device-alias-3 your-visibility-class-3"></div>')
    };

    viewport.use('Custom', visibilityDivs);

    if(viewport.is('alias-1')) {
        // ...
    }

})(jQuery, ResponsiveBootstrapToolkit);
````

