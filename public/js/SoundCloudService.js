app.factory('SoundCloudService', ['$http', '$q', function($http, $q) {

  var scClientId = '895ead636a70123bfce41e7cfd07a914';
  SC.initialize({ client_id: scClientId });

  var scService = {

    playSong: function(track) {

      var promise = $http.put('/api/request/', JSON.stringify(track)).then(function(res) {
        return res.data;
      });

    },

    searchFor: function(query) {

      var deferred = $q.defer();
      var promise = deferred.promise;

      SC.get('/tracks', {q: query}, function(tracks) {

        deferred.resolve(tracks);

      });

      return $q.all(promise);

    },

    getCurrent: function() {
      var promise = $http.get('/api/current').then(function(res) {
        return res.data;
      });

      return promise;
    },

    getQueue: function() {
      var promise = $http.get('/api/queue').then(function(res) {
        return res.data;
      });

      return promise;
    }

  };

  return scService;

}]);
