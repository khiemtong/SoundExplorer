app.controller('searchController', ['$scope', 'SocketIoService', 'SoundCloudService', function($scope, SocketIoService, SoundCloudService) {

	$scope.scModel = {};
	$scope.scModel.playlist = [];
	$scope.muteState = "Mute";
	$scope.volume = 1;
	$scope.sliderConfig = { min: 0, max: 1, currentVal: $scope.volume, step: 0.025 };

	$scope.amount = 0;
	$scope.isMuted = false;
	//$scope.amount = 0;
	var tracksHash = {};

	var currentSound;
	//var currentVolume = 0;
	var positionTimer;

	// Initialize client id here
	var scClientID = '';
	SoundCloudService.init(scClientID);

	SoundCloudService.getQueue().then(function(queue) {
		if (queue) {
			$scope.scModel.playlist = queue;
		}
	});

	SocketIoService.on('stop current', function() {
		if (currentSound) {
			currentSound.stop();
		}
	});

	$scope.$watch('amount', function(newValue, oldValue) {
		if (currentSound) {
			$scope.volume = newValue;
			currentSound.setVolume($scope.volume);
		}
	});

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
			currentVolume = $scope.volume;


			console.log("Track uri " + track.uri + " at position " + track.position);
			sound.seek(track.position);
			$scope.currentlyPlaying = track.title;
			$scope.totalTimeForCurrent = $scope.toMinuteSeconds(track.duration);
			sound.play();

			positionTimer = setInterval(function() {
				//console.log(sound.getCurrentPosition());
				$scope.currentTrackTime = $scope.toMinuteSeconds(sound.getCurrentPosition()) + "/" + $scope.totalTimeForCurrent;

				// make sure changes are applied
				if (!$scope.$$phase) {
					$scope.$apply();
				}

			}, 100);

		});
	});

	SocketIoService.on('update queue', function(queue) {
		console.log(queue);
		$scope.scModel.playlist = queue;
	});

	$scope.toMinuteSeconds = function toMinuteSeconds(msTime) {
		var totalSeconds = Math.floor(msTime/1000);
		var totalMinutes = Math.floor(totalSeconds/60);
		var seconds = totalSeconds % 60;

		if (seconds < 10) {
			seconds = "0" + seconds;
		}

		return totalMinutes + ":" + seconds;
	};

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
		SoundCloudService.playSong(toPlay).then(function(res) {
			console.log(res);
		});
	};

	$scope.mute = function() {
		if (currentSound) {
			var volume = currentSound.getVolume();
			currentSound.setVolume(volume === 0 ? $scope.volume : 0);
			$scope.isMuted = volume === 0;
		}
	};



	$scope.skip = function() {
		SoundCloudService.skipCurrent().then(function(res) {
			console.log(res);
		});

		// do we really need a digest cycle to resolve a promise?
		if (!$scope.$$phase) {
			$scope.$apply();
		}

	};

}]);
