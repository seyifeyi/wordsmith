var appControllers = angular.module("appControllers", ["ngResource", "ui.bootstrap"]);


appControllers.controller("LoginController", ["$scope", "$resource", "$q", "$location", "$routeParams",
        function($scope, $resource, $q, $location, $routeParams) {
                var resource = $resource('../Api/Router.php');
		$scope.showForm = "login";
		$scope.errors = [];
		$scope.existingWorker = null;

		$scope.login = function() {
			var username = $scope.username;
			var password = $scope.password;
			$scope.existingWorker = resource.get({"route": "getWorker", "workersId": $scope.username});
                        $scope.existingWorker.$promise.then(function() {
                                if ($scope.existingWorker.workers_id == $scope.username) {
                        		localStorage.setItem("sgUser", username);
                        		$location.path("/game");
                                }
                        });
		}

		$scope.showLogin = function() {
			$scope.showForm = "login";
		}

		$scope.showRegister = function() {
			$location.path("/register");
		}

		$scope.hideAll = function() {
                        $("#login-form").hide();
                        $("#login-buttons").hide();
                        $("#register-form").hide();
                        $("#register-buttons").hide();
		}
	}
]);


appControllers.controller("RegisterController", ["$scope", "$resource", "$q", "$location", "$routeParams",
        function($scope, $resource, $q, $location, $routeParams) {
                var resource = $resource('../Api/Router.php');
                $scope.showForm = "register";
                $scope.errors = [];
                $scope.existingWorker = null;

                $scope.register = function() {
                        $scope.validateRegistration();

			if ($scope.errors.length > 0) {
				return false;
			} else {
				var leaderboardRecord = {};
				leaderboardRecord.workersId = $scope.regUsername;
				leaderboardRecord.workersName = $scope.regUsername;
				leaderboardRecord.workersPass = $scope.regUsername;
				leaderboardRecord.workersCode = $scope.regUsername + $scope.regUsername;
				leaderboardRecord.route = "newLeaderboardRecord";
				resource.save(leaderboardRecord);
			}
			localStorage.setItem("sgUser", $scope.regUsername);

			if ($routeParams.imageId) {
				currentImageId = $routeParams.imageId;
				$location.path("/game/" + currentImageId);
			} else {
				$location.path("/game");
			}
                }

                $scope.validateRegistration = function() {
                        if ($scope.regUsername === undefined || $scope.regUsername == "" || isNaN(parseInt($scope.regUsername)) || $scope.regUsername.length < 6) {
				$scope.errors = ["Enter your CrowdFlower ID"];
			}

			/*
                        $scope.existingWorker = resource.get({"route": "getWorker", "workersId": $scope.regUsername});
                        $scope.existingWorker.$promise.then(function() {
                                if($scope.existingWorker.workers_id == $scope.regUsername) {
                                        $scope.errors.push("That username has been taken");
                                }
                        });
			*/
                }
	}
]);


appControllers.controller("GameController", ["$scope", "$resource", "$q", "$timeout", "$location", "$routeParams",
	function($scope, $resource, $q, $timeout, $location, $routeParams) {
		var sgUser = localStorage.getItem("sgUser");
		if(sgUser === "undefined" || sgUser == "" || sgUser == null) {
			$location.path("/login");
		}
                var socket = io.connect("http://188.226.152.84:8080");
                var resource = $resource('../Api/Router.php');

		$scope.imageSetSize = 2200;
		$scope.worker = resource.get({"route": "getWorker", "workersId": sgUser});
		$scope.badges = resource.query({"route": "getBadges"});
		$scope.levels = resource.query({"route": "getLevels"});
		$scope.images = resource.query({"route": "getImageSet", "limit": $scope.imageSetSize});
		$scope.activities = resource.query({"route": "getActivities", "limit": 5});
		$scope.leaderboard = resource.query({"route": "getTopLeaderboardRecords", "limit": 5, "cutoff": 1});

		$scope.keywords = [];
                $scope.progressType = "info";
                $scope.counter = 0;
		$scope.gameCounter = 0;
		$scope.maxBadges1 = 11;
		$scope.maxBadges2 = 15;
		$scope.maxBadges3 = 32;
                $scope.maxTime = 60;
		$scope.maxPoint = 100;
		$scope.maxRestrictedTags = 0;
		$scope.maxKeywords = 2;
		$scope.maxBonusPoints = 3;
		$scope.attempts = 0;
		$scope.bonusPoints = 0;
		$scope.bonusPointsValue = 0;
		$scope.bonusPointsCollected = {"single": 0, "double": 0, "triple": 0, "total": 0}
		$scope.bonusTreasurePoints = {"bronze": 0, "silver": 0, "gold": 0, "platinum": 0, "palladium": 0, "rhodium": 0, "ruthenium": 0, "iridium": 0, "osmium": 0, "total": 0};
                $scope.tagState = ["", "", "", "", ""];
                $scope.tagGlyph = ["", "", "", "", ""];
                $scope.tagAlert = ["hide", "hide", "hide", "hide", "hide"];
		$scope.controlTextAlert = "hide";
                $scope.tagAlertText = [];
                $scope.tagErrorMessage = "Please fill in all the tags";
                $scope.tagHasError = true;
		$scope.controlTextHasError = true;
		$scope.attemptsTimePenalty = 10;
		$scope.attemptsPointPenalty = 50;
		$scope.initializationStatus = "new";
		$scope.newBadgeName = "";
		$scope.messageAlerts = [];
		$scope.alertPoints = {"badges": [18, 29, 47, 76], "points": [1, 2, 3], "treasure": []};
		$scope.imageStartPoint = false;
		$scope.image = {"image_name":"100000000000000000000000000000000000000000000000000000000000000000","tags":["asian","woman","windows","mouse","girl","keyboard","monitor"]}
		$scope.workerTags = [];
		$scope.incentiveParameters = {"offered": [], "lastOffered": "", "workersInc": 0, "target": 0};
		$scope.treasurePointsThreshold = 10;

		$scope.setMaxValues = function(rank, attempts) {
			if(typeof rank === "undefined") 
				rank = $scope.worker.workers_level.level_rank;
			if(typeof attempts === "undefined") 
				attempts =  $scope.attempts;

			var maxTime = $scope.maxTime;
			var maxPoint = $scope.maxPoint;
			var maxRestrictedTags = $scope.maxRestrictedTags;
			switch(rank) {
				case "Newbie":
					maxTime = 120;
					maxPoint = 250;
					$scope.maxRestrictedTags = 0;
					$scope.maxKeywords = 2;
					break;
				case "Novice":
					maxTime = 100;
                                        maxPoint = 260;
                                        $scope.maxRestrictedTags = 2;
					$scope.maxKeywords = 2;
					break;
				case "Competent":
					maxTime = 80;
                                        maxPoint = 275;
                                        $scope.maxRestrictedTags = 2;
					$scope.maxKeywords = 3;
					break;
				case "Master":
					maxTime = 70;
                                        maxPoint = 295;
                                        $scope.maxRestrictedTags = 3;
					$scope.maxKeywords = 3;
					break;
                                case "Champion":
                                        maxTime = 65;
                                        maxPoint = 320;
                                        $scope.maxRestrictedTags = 3;
                                        $scope.maxKeywords = 3;
                                        break;
                                case "Maestro":
                                        maxTime = 60;
                                        maxPoint = 350;
                                        $scope.maxRestrictedTags = 4;
                                        $scope.maxKeywords = 3;
                                        break;
                                case "Commander":
                                        maxTime = 55;
                                        maxPoint = 385;
                                        $scope.maxRestrictedTags = 4;
                                        $scope.maxKeywords = 4;
                                        break;
                                case "Grand Duke":
                                        maxTime = 50;
                                        maxPoint = 425;
                                        $scope.maxRestrictedTags = 5;
                                        $scope.maxKeywords = 5;
                                        break;
                                case "Wordsmith":
                                        maxTime = 45;
                                        maxPoint = 300;
                                        $scope.maxRestrictedTags = 5;
                                        $scope.maxKeywords = 6;
                                        break;

			}
			$scope.maxTime = maxTime - (attempts * $scope.attemptsTimePenalty);
			$scope.maxPoint = maxPoint - (attempts * $scope.attemptsPointPenalty);
		}

		$scope.updateMaxValues = function() {
			var bonusPointValue = 0.20 * $scope.maxPoint;
			if ($scope.bonusPoints > 0) {
				switch ($scope.bonusPoints) {
					case 1:
						$scope.bonusPointsName = "single ";
						$scope.bonusPointsValue = (bonusPointValue*1);
						$scope.bonusPointsCollected["single"] += 1;
						break;
                                        case 2:
                                                $scope.bonusPointsName = "double ";
						$scope.bonusPointsValue = (bonusPointValue*2);
						$scope.bonusPointsCollected["double"] += 1;
                                                break;
                                        case 3:
                                                $scope.bonusPointsName = "triple ";
						$scope.bonusPointsValue = (bonusPointValue*3);
						$scope.bonusPointsCollected["triple"] += 1;
                                                break;
				}
				$scope.maxPoint = $scope.bonusPointsValue + $scope.maxPoint;
			}
			var btCounter = 1;
			for (var treasureKey in $scope.bonusTreasurePoints) {
				if (treasureKey != "total") {
                        		if ($scope.bonusPointsCollected["total"] > (btCounter * $scope.treasurePointsThreshold) 
						&& $scope.bonusTreasurePoints[treasureKey] == 0) {

						$scope.bonusTreasurePointsName = treasureKey;
						$scope.bonusTreasurePointsValue = (btCounter * 7) * $scope.bonusPointsValue;
                        		        $scope.maxPoint = $scope.bonusTreasurePointsValue + $scope.maxPoint;
						$scope.bonusTreasurePoints[treasureKey] += 1;
						$scope.bonusTreasurePoints["total"] += 1;
                        		}
					btCounter += 1;
				}
			}
		}

		$scope.getWorkerLevel = function(workersInc) {
			var levels = $scope.levels;

			for(var i = 0; i < levels.length; i++) {
				var level = levels[i];
				if((workersInc >= level.level_min) && (workersInc <= level.level_max)) {
					return level;
				}
			}
			return levels[0];
		}

		$scope.getWorkerCompletion = function() {
			return Math.round(($scope.worker.workers_inc / $scope.worker.workers_level.level_max) * 100);
		}

		$scope.getWorkerBadges = function() {
			var badges = $scope.badges;
			var worker = $scope.worker;
			var workerBadges = [];
			for(var i = 0; i < badges.length; i++) {
				var badge = badges[i];
				if(worker.workers_inc >= badge.workers_inc) {
					workerBadges.push(badge.badge_name);
				}
			}
			return workerBadges;
		}

		$scope.getBadgeAllocations = function() {
			var allocations = {};
			for(var i = 0; i < badges.length; i++) {
			    allocations[badge.workers_inc] = badge.badge_url;
			}
		}

                $scope.checkMessageAlert = function(alertType) {
                    var type, title, message;
                    switch(alertType) {
                        case "badges":
                            if($scope.alertPoints["badges"].indexOf($scope.worker.workers_inc) != -1) {
                                type = "success";
                                title = "You are close to a badge...";
                                message = "Just a few more images and you will unlock an exciting new badge - you're almost there.";
                            }
                        break;

                        case "points":
                            if($scope.alertPoints["points"].indexOf($scope.bonusPointsCollected["total"]) != -1) {
                                type = "info";
                                title = "You earned bonus points!";
                                message = "Typing in the right words earn you either single, double and triple bonus points";
                            }
                        break;

                        case "treasure":
                            if ($scope.bonusTreasurePoints["total"] > 0) {
                                type = "info";
                                title = "You earned treasure points!";
                                message = "Earning multiple bonus points (10, 20, 30) stack up to earn you extra treasure points";
                            }
                        break;
                    }
                    if(type != null) $scope.messageAlerts[0] = {"type": type, "title": title, "message": message};
                }

		$scope.closeMessageAlert = function(index) {
			$scope.messageAlerts.splice(index, 1);
		};

		$scope.getNextImage = function() {
			if ($scope.worker.workers_inc == ($scope.imageSetSize - 1)) {
                                $scope.showGameOver();
                        }
			else {
				$scope.initializationStatus = "old";

				// We need to have the ImageSet ready
				$scope.images.$promise.then(function() {
					$scope.worker.workers_last_image_id = parseInt($scope.worker.workers_last_image_id) + 1;
					var imageName = $scope.images[$scope.worker.workers_last_image_id].image_name;

					if ($routeParams.imageId !== undefined && $scope.imageStartPoint == false) {
						$scope.image = resource.get({"route": "findImageById", "imageId": $routeParams.imageId});
						$scope.imageStartPoint = true;
						$scope.image.$promise.then(function() {
							var imageIndex = $scope.getImageIndex($scope.image.image_name, $scope.images);
							// we want to sort the images array, such that the next image starts from the index after
							var nextImages = $scope.images.slice(imageIndex + 1);
							var prevImages = $scope.images.slice(0, imageIndex);
							nextImages.push.apply(nextImages, prevImages);
							for (var i = 0; i < nextImages.length; i++) {
								$scope.images[i] = nextImages[i];
							}
						});
					} else {
						$scope.image = resource.get({"route": "findImageByName", "imageName": imageName});
					}
					$scope.image.image_name = "spinner.gif";

					$scope.attempts = 0;
					$scope.counter = 0;
					$scope.setMaxValues();
					$scope.stopTimer();
					$scope.startTimer();
					$scope.getNextControlText();
					$scope.checkMessageAlert("badges");
					return $scope.image;
				});
			}
		}

		$scope.getImageIndex = function(imageName, images) {
			for (var i = 0; i < images.length; i++) {
				if (images[i].image_name == imageName) {
					return i;
				}
			}
			return 0;
		}

		$scope.addUserImage = function() {
			$scope.bonusPoints = 0;
			$scope.bonusTreasurePoints["total"] = 0;

			if(!$scope.tagHasError && !$scope.controlTextHasError) {
			    var userImage = {};
      			    userImage.imageName = $scope.image.image_name;
			    userImage.workersId = $scope.worker.workers_id;

			    var image_tags = [];
			    for(var i = 0; i < $scope.maxKeywords; i++) {
				image_tags.push($scope.keywords[i]);
				$scope.addToWorkerTags($scope.keywords[i]);
				if($scope.image.tags.indexOf($scope.keywords[i]) != -1) {
				    $scope.bonusPoints += 1;									// assign bonus points if this word matches an existing tag
				    $scope.bonusPointsCollected["total"] += 1;
				}
			    }
			    userImage.tags = image_tags;
		 	    userImage.route = "addUserImage";
			    resource.save(userImage);

			    $scope.updateMaxValues();
		    	    $scope.bonusPointsNotifications();
			    $scope.bonusTreasurePointsNotifications();
			    $scope.updateLeaderboardRecord();

                            if (($scope.worker.workers_inc+1) == ($scope.imageSetSize - 1)) {
                                $scope.showGameOver();
                            } else {
			        $scope.getNextImage();
			        $scope.resetTags();
			        $scope.checkMessageAlert("points");
				$scope.checkMessageAlert("treasure");
			    }
			}
		}

		$scope.addToWorkerTags = function(currentTag) {
                        $scope.workerTags.push(currentTag);									// for spam checking
			$scope.workerTags.push(currentTag + "s");
			if (currentTag.slice(-1) == "s") {
				$scope.workerTags.push(currentTag.slice(0,-1));
			}
			console.log($scope.workerTags.push);
                        if ($scope.workerTags.length > 12) {
                                $scope.workerTags.splice(0,1);
                        }
		}

		$scope.findRecentWorkerImages = function() {
			$scope.recentWorkerImages = [];

			var taggedImage = {};
			taggedImage.workersId = $scope.worker.workers_id;
			taggedImage.limit = 5;
			taggedImage.route = "findRecentWorkerImages";
			$scope.recentWorkerImages = resource.query(taggedImage);
                        $scope.recentWorkerImages.$promise.then(function() {
                               console.log($scope.recentWorkerImages); 
                        });
			$scope.initializationStatus = "recentimages";
		}

		$scope.backToGame = function() {
			$scope.getNextImage();
		}

		$scope.addToActivitiesLog = function(worker, actionDone, actionObject, icon, broadcast) {
			var activity = {};
			activity.workersId = $scope.worker.workers_id;
			activity.actionDone = actionDone;
			activity.actionObject = actionObject;
			activity.icon = icon;
			activity.route = "addActivity";
			activity.timestamp = new Date().getTime();

			var updatedActivity = resource.save(activity);
			if (typeof broadcast === "undefined") {
                            updatedActivity.$promise.then(function() {
				socket.emit("addToActivitiesLog", updatedActivity);
                            });
			}
		}

		$scope.getActivityRecency = function(activityTimestamp) {
			if (activityTimestamp === undefined) return "";
			var currentTimestamp = new Date().getTime();
			var activitySeconds = Math.round((currentTimestamp - activityTimestamp) / 1000);
			if (activitySeconds < 60) {
				return activitySeconds + " seconds";
			} else if (activitySeconds >= 60 && activitySeconds < 3600) {
				return Math.round(activitySeconds / 60) + " minutes";
			} else if (activitySeconds >= 3600 && activitySeconds < 86400) {
				return Math.round(activitySeconds / 3600) + " hours";
			} else if (activitySeconds >= 86400) {
				return Math.round(activitySeconds / 86400) + " days";
			}
		}

		$scope.updateLeaderboardRecord = function() {
                        var leaderboardRecord = {};
                        leaderboardRecord.workersId = $scope.worker.workers_id;
			leaderboardRecord.points = $scope.maxPoint;
			leaderboardRecord.workersLastImageId = $scope.worker.workers_last_image_id;
                        leaderboardRecord.route = "updateLeaderboardRecord";

                	var updatedLeaderboardRecord = resource.save(leaderboardRecord);
			var leaderboardPosition = $scope.getLeaderboardPosition();
			var leaderboardPoints = parseInt($scope.worker.workers_points) + $scope.maxPoint;

                        $q.all([updatedLeaderboardRecord.$promise, leaderboardPosition.$promise]).then(function() {
				leaderboardPosition = leaderboardPosition["workers_position"];
				$scope.leaderboardNotifications(leaderboardPosition);
				$scope.worker.workers_inc = parseInt($scope.worker.workers_inc) + 1;
				$scope.worker.workers_points = leaderboardPoints;
				$scope.worker.workers_position = leaderboardPosition;
                                $scope.getWorkersParameters();
				$scope.checkIncentivePromise();
				socket.emit("updateLeaderboard", $scope.worker);
                        });
		}
		
		$scope.leaderboardNotifications = function(leaderboardPosition) {
			if(($scope.worker.workers_position > 5) && (leaderboardPosition < $scope.worker.workers_position) && (leaderboardPosition <= 5)) {
				$("#enterleaderboard-congrats").delay($scope.congratsDelay).fadeIn().delay(5000).fadeOut();
				$("#enterleaderboard-div").delay($scope.congratsDelay).fadeIn().fadeOut().fadeIn().fadeOut().fadeIn().fadeOut().fadeIn().delay(3000).fadeOut();

				$scope.addToActivitiesLog($scope.worker, " is now on ", " The Leaderboard", "globe.png");
			}
			if($scope.worker.workers_position <= 5 && leaderboardPosition < $scope.worker.workers_position) {
				$("#climbleaderboard-congrats").delay($scope.congratsDelay).fadeIn().delay(5000).fadeOut();
				$("#climbleaderboard-div").delay($scope.congratsDelay).fadeIn().fadeOut().fadeIn().fadeOut().fadeIn().fadeOut().fadeIn().delay(3000).fadeOut();

				$scope.addToActivitiesLog($scope.worker, " climbed up ", " The Leaderboard", "star.png");
			}
		}

		$scope.changeLeaderboardCutoff = function(cutoff) {
			 $scope.leaderboard = resource.query({"route": "getTopLeaderboardRecords", "limit": 5, "cutoff": cutoff});
		}

		$scope.checkIncentivePromise = function() {
                        $scope.incentiveParameters = {"offered": [], "lastOffered": "", "workersInc": 0, "target": 0};
			if ($scope.incentiveParameters["lastOffered"] != "") {
				if (parseInt($scope.worker.workers_inc) 
					== (parseInt($scope.incentiveParameters["workersInc"]) + parseInt($scope.incentiveParameters["target"]))) {

					switch ($scope.incentiveParameters["lastOffered"]) {
					    case "access":
						$scope.treasurePointsThreshold = 7;
						alert("You now need 50% less tags to acquire 'Treasure Points' \n5 bonus points instead of 10");
						break;
                                            case "power":
						alert("You can now view the last tags posted by a player \nClick anyone on 'The Leaderboard'");
                                                break;
                                            case "stuff":
						alert("5 cents bonus has been paid into your account");
                                                break;
                                            case "leaderboard":
						alert("You have been fast-tracked up \nThe Global Leaderboard");
                                                break;
                                            case "levels":
						alert("You have been fast-tracked to \nThe Next Level");
                                                break;
                                            case "badges":
						alert("You have been awarded the hidden \nUltimate Badge");
                                                break;
					}
				}
			}
		}

		$scope.showGameOver = function() {
			$scope.initializationStatus = "gameover";
				for (var j = 0; j < 10; j++) {
				for (var i = 0; i < 5; i++) {
					var timeDelay = 500 * i;
					$("#gameover-stars-"+i).delay(timeDelay).css("top", $scope.getRandomNumber(100)+"px")
						.fadeIn().fadeOut().fadeIn().fadeOut()
						.css("top", $scope.getRandomNumber(100)+"px")
						.fadeIn().fadeOut().fadeIn().delay(2000).fadeOut();
				}
				}
		}

		$scope.bonusPointsNotifications = function() {
			$scope.congratsDelay = 0;

			if($scope.bonusPoints > 0 && $scope.bonusTreasurePoints["total"] == 0) {
				$scope.congratsDelay = 6000;
				$("#bonuspoints-congrats").fadeIn().delay(5000).fadeOut();

				if($scope.bonusPoints > 0) $("#bonus-points-0").fadeIn().fadeOut().fadeIn().fadeOut().fadeIn().fadeOut().fadeIn().delay(1500).fadeOut();
				if($scope.bonusPoints > 1) $("#bonus-points-1").delay(200).fadeIn().fadeOut().fadeIn().fadeOut().fadeIn().fadeOut().fadeIn().delay(1500).fadeOut();
				if($scope.bonusPoints > 2) $("#bonus-points-2").delay(400).fadeIn().fadeOut().fadeIn().fadeOut().fadeIn().fadeOut().fadeIn().delay(1500).fadeOut();

				$scope.addToActivitiesLog($scope.worker, " has earned ", $scope.bonusPointsName+" bonus points", "coin.png");
			}
		}

		$scope.bonusTreasurePointsNotifications = function(treasureKey) {
			if ($scope.bonusTreasurePoints["total"] > 0) {
				$("#bonustreasurepoints-congrats").fadeIn().delay(5000).fadeOut();
                                $("#bonustreasurepoints-div").delay($scope.congratsDelay).fadeIn().fadeOut().fadeIn().fadeOut().fadeIn().fadeOut().fadeIn().delay(3000).fadeOut();

				$scope.addToActivitiesLog($scope.worker, " has earned ", $scope.bonusTreasurePointsName+" treasure points", $scope.bonusTreasurePointsName+".png");
			}
		}

		$scope.getLeaderboardPosition = function(workersId) {
			if(typeof workersId === "undefined") workersId = $scope.worker.workers_id;

			var leaderboardRequest = {};
			leaderboardRequest.route = "getLeaderboardPosition";
			leaderboardRequest.workersId = workersId;

			return resource.get(leaderboardRequest);
		}

		$scope.retryAddUserImage = function() {
			$scope.attempts = parseInt($scope.attempts) + 1;
			$scope.counter = 0;
			$scope.resetTags();
                        $scope.setMaxValues();
			$scope.stopTimer();
			$scope.startTimer();
		}

		$scope.resetTag = function(tagId) {
                        $scope.tagState[tagId] = "";
                        $scope.tagGlyph[tagId] = "";
                        $scope.tagAlert[tagId] = "hide";
			$scope.keywords[tagId] = "";
		}

		$scope.resetControlText = function() {
			$scope.controlTextState = "";
			$scope.controlTextGlyph = "";
			$scope.controlTextAlert = "hide";
			$scope.controlTextAlertText = "";
		}

		$scope.resetTags = function() {
                        for(var i = 0; i < $scope.maxKeywords; i++) {
                                $scope.resetTag(i);
                        }
			$scope.resetControlText();
		}

		$scope.applyTagErrorState = function(tagId) {
			$scope.tagState[tagId] = "has-error";
			$scope.tagGlyph[tagId] = "glyphicon-remove";
			$scope.tagAlert[tagId] = "alert-danger";
			$scope.tagAlertText[tagId] = "This is a reserved word for this picture";
		}

                $scope.applyTagSuccessState = function(tagId) {
			$scope.tagState[tagId] = "has-success";
			$scope.tagGlyph[tagId] = "glyphicon-ok";
			$scope.tagAlert[tagId] = "hide";
			$scope.tagAlertText[tagId] = "";
                }

		$scope.validateSpamTag = function(tagId) {
			var currentTag = $scope.keywords[tagId];
			if ($scope.workerTags.indexOf(currentTag) > -1) {
				$scope.applyTagErrorState(tagId);
				$scope.tagErrorMessage = "Repeated word";
				$scope.tagAlertText[tagId] = "Please enter a different word";
				$scope.tagHasError = true;
			}
		}

		$scope.validateEnglishTag = function(tagId) {
                        var isValidEnglishString = {};
                        isValidEnglishString.route = "isValidEnglishString";
                        isValidEnglishString.tag = $scope.keywords[tagId];

                        var isValidEnglish = resource.get(isValidEnglishString);
                        isValidEnglish.$promise.then(function() {
                                if(isValidEnglish.isValid == "false") {
					$scope.applyTagErrorState(tagId);
					$scope.tagErrorMessage = "Invalid English word";
					$scope.tagAlertText[tagId] = "Please enter a valid English word";
					$scope.tagHasError = true;
				}
                        });
		}

		$scope.validateTag = function(tagId) {
			$scope.validateEnglishTag(tagId);

			var tagIsValid = true;
			for(var i = 0; i < $scope.maxRestrictedTags; i++) {
			    if($scope.keywords[tagId] == $scope.image.tags[i] || $scope.keywords[tagId] == "") {
				$scope.applyTagErrorState(tagId);
				tagIsValid = false;
			    }
			}
			if(($scope.keywords[tagId]).length != 0 && tagIsValid) {
			    $scope.applyTagSuccessState(tagId);
			}
			if(($scope.keywords[tagId]).length == 0) {
			    $scope.resetTag(tagId);
			}

			for(var i = 0; i < $scope.maxKeywords; i++) {
                            if($scope.tagState[i] == "") {
                                $scope.tagErrorMessage = "Please enter in text in tag " + (parseInt(i) + 1);
                                $scope.tagHasError = true;
                            } else if($scope.tagState[i] == "has-error") {
                                $scope.tagErrorMessage = "There is an error with tag " + (parseInt(i) + 1);
                                $scope.tagHasError = true;
                            } else if(($scope.keywords[i] == $scope.keywords[tagId]) && i != tagId) {
				$scope.applyTagErrorState(tagId);
                                $scope.tagErrorMessage = "Duplicate text in tag " + (parseInt(i) + 1) + " and " + (parseInt(tagId) + 1);
				$scope.tagAlertText[tagId] = "Duplicate text in tag " + (parseInt(i) + 1) + " and " + (parseInt(tagId) + 1);
                                $scope.tagHasError = true;
			    } else {
                                $scope.tagErrorMessage = "";
                                $scope.tagHasError = false;
			    }
                        }
			$scope.validateSpamTag(tagId);
		}
		
		$scope.control_texts = ["Enter the current month (e.g. january, february)", "Enter the current day (e.g. monday, tuesday)", "Current Month", "Current Day"];

		$scope.getNextControlText = function() {
                        $scope.current_control_text = "";
                        $scope.shorter_control_text = "";

			if (	($scope.worker.workers_last_image_id == 0) || ($scope.worker.workers_last_image_id == 1) || ($scope.worker.workers_last_image_id == 2) ||
				($scope.worker.workers_last_image_id % 10 == 0) || ($scope.worker.workers_last_image_id % 11 == 0)) 
			{
				$scope.control_text_id = ($scope.worker.workers_last_image_id) ? ($scope.worker.workers_last_image_id % 2) : 0;
				$scope.current_control_text = $scope.control_texts[$scope.control_text_id];
				$scope.shorter_control_text = $scope.control_texts[parseInt($scope.control_text_id) + 2]; 
				$scope.workers_control_text = "";
			}
			else {
				$scope.controlTextHasError = false;
			}
		}

		$scope.validateControlText = function() {
			if ($scope.current_control_text == "") return false;

			var gMonths = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
			var gDays = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
			var gDate = new Date();
			var controlText = gMonths[gDate.getMonth()];

			if (($scope.control_text_id % 2) == 1) {
				controlText = gDays[gDate.getDay()];
			}
			if ($scope.workers_control_text.toLowerCase() != controlText.toLowerCase()) {
                                $scope.controlTextState = "has-error";
                                $scope.controlTextGlyph = "glyphicon-remove";
                                $scope.controlTextAlert = "alert-danger";
				$scope.controlTextAlertText = "That is the wrong answer";
				$scope.controlTextHasError = true;
			} else {
                                $scope.controlTextState = "has-success";
                                $scope.controlTextGlyph = "glyphicon-ok";
                                $scope.controlTextAlert = "hide";
                                $scope.controlTextAlertText = "";
				$scope.controlTextHasError = false;
			}
			if($scope.workers_control_text == "") {
				$scope.resetControlText();
			}
		}

		$scope.showStartNextLevel = function() {
			$scope.stopTimer();
			$scope.initializationStatus = "nextlevel";
			$("#next-level-div").fadeIn().fadeOut().fadeIn().fadeOut().fadeIn().fadeOut().fadeIn();
			$("#spot").show();
			window.onmousemove = $scope.moveSpot;
		}

		$scope.startNextLevel = function() {
			$scope.startTimer();
			$scope.initializationStatus = "old";
			$("#spot").hide();
			window.onmousemove = false;
		}

		$scope.getWorkersParameters = function() {
			var workers_num_badges = -1;
			if ($scope.worker.workers_badges) {
				workers_num_badges = $scope.worker.workers_badges.length;
			}

			var current_workers_level = ($scope.worker.workers_level === undefined) ? "" : $scope.worker.workers_level.level_rank;
                        $scope.worker.workers_level = $scope.getWorkerLevel( $scope.worker.workers_inc );
			
			if (current_workers_level != "" && (current_workers_level.toLowerCase() != $scope.worker.workers_level.level_rank.toLowerCase())) {
				$scope.showStartNextLevel();
			}

                        $scope.worker.workers_completion = $scope.getWorkerCompletion();
                        $scope.worker.workers_badges = $scope.getWorkerBadges();
	
			if (($scope.worker.workers_badges.length > workers_num_badges) && workers_num_badges != -1) {
				var newBadgeId = $scope.worker.workers_badges.length - 1;
				$scope.newBadgeName = $scope.badges[ newBadgeId ].badge_name;
				$("#newbadge-congrats").delay($scope.congratsDelay).fadeIn().delay(5000).fadeOut();
				$("#newbadge-div").delay($scope.congratsDelay).fadeIn().fadeOut().fadeIn().fadeOut().fadeIn().fadeOut().fadeIn().delay(3000).fadeOut();

				$scope.addToActivitiesLog($scope.worker, " unlocked the ", $scope.newBadgeName, "award"+ $scope.worker.workers_badges.length +".png");
			}
		}
		

		// INITIAL INITIALIZATION //
		$q.all([$scope.worker.$promise, $scope.levels.$promise, $scope.badges.$promise]).then(function() {
			$scope.initializationStatus = "new";
			$scope.getWorkersParameters();
			$scope.startGameTimer();
		});


		// SOCKET FUNCTIONS //
		$q.all([$scope.worker.$promise, $scope.leaderboard.$promise, $scope.activities.$promise]).then(function() {

			socket.on('connect', function() {
				socket.emit('addUser', $scope.worker.workers_id, "turk");
				socket.emit('initLeaderboard', $scope.leaderboard);
			});
			socket.on('updatechat', function (username, data) {
			});
			socket.on('updateusers', function(data) {
			});
			socket.on('updateroom', function(data) {
			});
                        socket.on('updateLeaderboard', function(worker) {
				var newLeaderboardRecords = [];
				var newLeaderboardEntry = worker;
				var workerInserted = false;
				
				for(var i = 0; i < ($scope.leaderboard).length; i++) {
					leader = $scope.leaderboard[i];
					if((leader.workers_points > worker.workers_points) && (leader.workers_id != worker.workers_id)) {
						newLeaderboardRecords.push(leader);
					} else if((worker.workers_points > leader.workers_points) && (leader.workers_id == worker.workers_id)) {
						if(workerInserted == false) {
							newLeaderboardRecords.push(worker);
							workerInserted = true;
						}
					} else if((worker.workers_points > leader.workers_points) && (leader.workers_id != worker.workers_id)) {
						if(workerInserted == true) {
							newLeaderboardRecords.push(leader);
						} else {
							newLeaderboardRecords.push(worker);
							newLeaderboardRecords.push(leader);
							workerInserted = true;
						}
					}
				}
				if($scope.leaderboard.length < newLeaderboardRecords.length) newLeaderboardRecords.pop();
				$scope.leaderboard = newLeaderboardRecords;
                        });
                        socket.on("addToActivitiesLog", function(activityRecord) {
                                $scope.activities.unshift(activityRecord);
				$scope.activities.pop();
                        });
		});

		
		// TIMER FUNCTIONS //

                $scope.onGameTimeout = function() {
                        $scope.gameCounter++;
                        gameTimeout = $timeout($scope.onGameTimeout,1000);
                }

		$scope.startGameTimer = function() {
			gameTimeout = $timeout($scope.onGameTimeout,1000);
		}

		$scope.onTimeout = function() {
			$scope.counter++;
			mytimeout = $timeout($scope.onTimeout,1000);
			if($scope.counter < (0.50*$scope.maxTime)) {
				$scope.progressType = "success";
			} else if($scope.counter < (0.70*$scope.maxTime)) {
				$scope.progressType = "info";
			} else if($scope.counter < (0.90*$scope.maxTime)) {
				$scope.progressType = "warning";
			} else if($scope.counter <= (1.00*$scope.maxTime)) {
				$scope.progressType = "danger";
			}
			if($scope.counter == $scope.maxTime) {
				$scope.stopTimer();
			}
		}
		$scope.startTimer = function() {
			mytimeout = $timeout($scope.onTimeout,1000);
		}

		$scope.stopTimer = function() {
			if(typeof mytimeout !== "undefined") {
				$timeout.cancel(mytimeout);
			}
		}

		$scope.spot = document.getElementById('spot');
		$scope.width = document.documentElement.clientWidth;
		$scope.height = document.documentElement.clientHeight;

		/* A bit of JS to respond to mouse events */
		$scope.moveSpot = function($event) {
			var e = $event;
			var x = 0;
			var y = 0;

			if (!e) var e = window.event;
			if (e.pageX || e.pageY) {
				x = e.pageX;
				y = e.pageY;
			} else if (e.clientX || e.clientY) {
				x = e.clientX + document.body.scrollLeft;
				y = e.clientY + document.body.scrollTop;
			}

			if (navigator.userAgent.match('AppleWebKit')) {
				var style = '-webkit-gradient(radial, '+x+' '+y+', 0, '+x+' '+y+', 100, from(rgba(0,0,0,0)), to(rgba(0,0,0,0.8)), color-stop(0.8, rgba(0,0,0,0)))';
			} else {
				var style = '-moz-radial-gradient('+x+'px '+y+'px 45deg,circle closest-side,transparent 0,transparent 100px,rgba(0, 0, 0, 0.8) 120px)';
			}
			$scope.spot.style.backgroundImage = style;
		}

                $scope.getNumber = function(num) {
                        return new Array(num);
                }
	
		$scope.getRandomNumber = function(num) {
			return Math.floor(Math.random() * num);
		}

		$scope.cancelImage = function() {
			$scope.initializationStatus = "new";		
		}

		$scope.logout = function() {
			localStorage.setItem("sgUser", null);
			$location.path("/login");
		}

		$scope.currentInstruction = 1;
		$scope.totalInstructions = 4;
		$scope.showInstruction = function(direction) {
			if(direction == 'prev' && $scope.currentInstruction > 1) {
				$scope.currentInstruction = parseInt($scope.currentInstruction) - 1;
			}
                        if(direction == 'next' && $scope.currentInstruction < $scope.totalInstructions) {
                                $scope.currentInstruction = parseInt($scope.currentInstruction) + 1;
                        }
			$(".game-instructions").hide();
			$("#gi-"+$scope.currentInstruction).fadeIn();
		}

		$scope.toggleInstructions = function() {
			if($("#instructions").is(":visible")) {
				$("#instructions").fadeOut();
				$("#instruction-title").html("View Instructions");
			} else {
				$("#instructions").fadeIn();
				$("#instruction-title").html("Hide Instructions");
			}
		}

		window.onbeforeunload = function (event) {
		    var numImagesTagged = $scope.worker.workers_inc;
		    if (numImagesTagged < 11) { 
		        var message = 'You are required to tag 11 images!\nYou have only tagged ' + numImagesTagged + ' images';
		        if (typeof event == 'undefined') {
			    event = window.event;
		        }
		        if (event) {
			    event.returnValue = message;
		        }
		        return message;
		    } else {
			var incentives = ["access", "power", "stuff", "leaderboard", "levels", "badges"];
			var msg3 = "Would you like to tag the next 11 images? \nYou would automatically be advanced on \nThe Global Leaderboard";
			var msg4 = "Would you like to tag the next 11 images? \nYou would automatically be advanced to \nThe Next Level";
			var msg5 = "Would you like to tag the next 11 images? \nYou would automatically be rewarded with \nThe 'Ultimate' Badge";

			var msg0 = "Would you like to tag the next 11 images? \nYou would be given quicker access to \nTreasure Points";
			var msg1 = "Would you like to tag the next 11 images? \nYou would be rewarded with the power to \nView Other Players Tags";
			var msg2 = "Would you like to tag the next 11 images? \nYou would be rewarded with a bonus of \n5 cents extra";

			var randomIncentive = Math.floor(Math.random() * 4);
			if (randomIncentive == 3) {
			    var statusIncentive = Math.floor(Math.random() * 3);
			    randomIncentive = randomIncentive + statusIncentive;
			}
			var incentiveMessages = [msg0, msg1, msg2, msg3, msg4, msg5];
                        if (typeof event == 'undefined') {
                            event = window.event;
                        }
                        if (event) {
                            event.returnValue = incentiveMessages[randomIncentive] + "\n";
                        }
			var incentiveOffered = incentives[randomIncentive];
			$scope.incentiveParameters = {"offered": [], "lastOffered": "", "workersInc": 0, "target": 0};

			$scope.incentiveParameters["offered"] = $scope.incentiveParameters["offered"].push(incentiveOffered);
			$scope.incentiveParameters["lastOffered"] = incentiveOffered;
			$scope.incentiveParameters["workersInc"] = $scope.worker.workers_inc;
			$scope.incentiveParameters["target"] = 11;
                        return message;
		    }
		};

	}
]);

