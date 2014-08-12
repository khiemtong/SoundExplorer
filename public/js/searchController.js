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

			console.log("Track uri " + track.uri + " at position " + track.position);
			sound.seek(track.position);
			$scope.currentlyPlaying = track.title;
			sound.play();

			positionTimer = setInterval(function() {
				//console.log(sound.getCurrentPosition());
				$scope.currentTrackTime = toMinuteSeconds(sound.getCurrentPosition());

				// make sure changes are applied
				if (!$scope.$$phase) {
					$scope.$apply();
				}
				
			}, 100);

		});
	});

	function toMinuteSeconds(msTime) {
		var totalSeconds = Math.floor(msTime/1000);
		var totalMinutes = Math.floor(totalSeconds/60);
		var seconds = totalSeconds % 60;

		if (seconds < 10) {
			seconds = "0" + seconds;
		}

		return totalMinutes + ":" + seconds;
	}

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
		var toPlay = tracksHash[trackId];
		$scope.currentlyPlaying = toPlay.title;
		SoundCloudService.playSong(toPlay);
	};

}]);
