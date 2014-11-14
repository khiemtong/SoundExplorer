app.directive('ngEnter', function() {

  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {

      if (event.which === 13) {
        scope.$apply(function() {
          scope.$eval(attrs.ngEnter);
        });

        event.preventDefault();
      }

    });
  };

});

// usage:
// provide a slider config with min, max, and step
app.directive("slider", function() {

  return {

    restrict: 'A',
    scope: {
      config: "=config",
      amount: "="
    },
    link: function(scope, elem, attrs) {

      elem.slider({
        range: false,
        min: scope.config.min,
        value: scope.config.currentVal,
        max: scope.config.max,
        step: scope.config.step,
        slide: function(event, ui) {
          scope.$apply(function() {
            scope.amount = ui.value;
          });
        }
      });

    }

  };

});
