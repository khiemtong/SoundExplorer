app.controller('searchController', ['$scope', 'SocketIoService', 'SoundCloudService', function($scope, SocketIoService, SoundCloudService) {

	$scope.scModel = {};
	var tracksHash = {};

	var currentSound;
	var positionTimer;

	// SoundCloudService.getCurrent().then(function(current) {
	// 	if (current) {
	// 		tracksHash[current.id] = current;
	// 		$scope.play(current.id);
	// 	}
	// });


	SocketIoService.on('new song', function(track) {

		console.log('play new track ' + track);

		//$("#message").text("Current playing: " + track.title);

		SC.stream("/tracks/" + track.id, function(sound) {

			if (currentSound) {
				currentSound.stop();
			}

			if (positionTimer) {
				clearInterval(positionTimer);
			}

			currentSound = sound;

			console.log("Sound uri: " + sound.uri + " at position " + track.position);
			sound.seek(track.position);
			console.log("Current playing position " + sound.getCurrentPosition());
			$scope.currentlyPlaying = sound.title;
			sound.play();

			// positionTimer = setInterval(function() {
			// 	//console.log(sound.getCurrentPosition());
			// 	$("#trackPosition").text(toMinuteSeconds(sound.getCurrentPosition()));
			// }, 100);

		});
	});

	$scope.searchFor = function() {

		if (!$scope.scModel.searchQuery) {
			console.log("Nothing to search for.");
		}

		SoundCloudService.searchFor($scope.scModel.searchQuery).then(function(tracks) {
				$scope.scModel.tracks = tracks;
				tracksHash = {};

				angular.forEach(tracks, function(item) {
					tracksHash[item.id] = item;
				});
				console.log(tracks);
		});
	};

	$scope.play = function(trackId) {
		SoundCloudService.playSong(tracksHash[trackId]);
	};

}]);
