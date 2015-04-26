var appControllers = angular.module("appControllers", ["ngResource", "ngSanitize", "ui.bootstrap"]);


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
                        		$location.path("/game/" + $routeParams.modeType);
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
			var suffix =  "_" + Math.floor(Math.random() * 9999);

			if ($scope.errors.length > 0) {
				return false;
			} else {
				var leaderboardRecord = {};
				leaderboardRecord.workersId = $scope.regUsername + suffix;
				leaderboardRecord.workersName = $scope.regUsername + suffix;
				leaderboardRecord.workersPass = $scope.regUsername + suffix;
				leaderboardRecord.workersCode = $scope.regUsername + $scope.regUsername;
				leaderboardRecord.route = "newLeaderboardRecord";
				resource.save(leaderboardRecord);
			}
			localStorage.setItem("sgUser", $scope.regUsername + suffix);

			if ($routeParams.imageId) {
				currentImageId = $routeParams.imageId;
				$location.path("/game/" + $routeParams.modeType + "/" + currentImageId);
			} else {
				$location.path("/game/" + $routeParams.modeType);
			}
                }

                $scope.validateRegistration = function() {
                        if ($scope.regUsername === undefined || $scope.regUsername == "" || isNaN(parseInt($scope.regUsername)) || $scope.regUsername.length < 6) {
				$scope.errors = ["Enter your CrowdFlower ID"];
			}

                }
	}
]);


appControllers.controller("HeatmapController", ["$scope", "$resource", "$q", "$location", "$routeParams",
        function($scope, $resource, $q, $location, $routeParams) {
                var resource = $resource('../Api/Router.php');

                $scope.showHeatmap = function() {
                        var heatmapInstance = h337.create({
                                container: document.querySelector('.heatmap')
                        });

                        var dataPoints = resource.query({"route": "getDataPoints", "workersId": null});
                        dataPoints.$promise.then(function(result) {
				var newResult = [];
				for (var i = 0; i < result.length; i++) {
					var newInsert = {"x": result[i]["x"], "y": result[i]["y"], "value": 5};
					newResult.push(newInsert);
				}
				var data = {
					max: 100,
					data: newResult
				};
				heatmapInstance.setData(data);
                        });
                }
	}
]);


appControllers.controller("GameController", ["$scope", "$resource", "$q", "$timeout", "$location", "$routeParams", "$sce",
	function($scope, $resource, $q, $timeout, $location, $routeParams, $sce) {
		var sgUser = localStorage.getItem("sgUser");
		if(sgUser === "undefined" || sgUser == "" || sgUser == null) {
			$location.path("/login/" + $routeParams.modeType);
		}
                //var socket = io.connect("http://188.226.152.84:8080");
		var socket = null;
                var resource = $resource('../Api/Router.php');

		$scope.requestMode = "getTextSet";
		$scope.modeType = $routeParams.modeType;
		
		if ($scope.modeType == "tweet") {
			$scope.entityTypes = ["person", "organisation", "location", "miscellaneous"];
		} else if ($scope.modeType == "tech") {
                        $scope.entityTypes = ["database", "library", "software", "language"];
		}

		var start = 0;
		var count = 0;
		if ($routeParams.imageId) {
			if ($routeParams.imageId >= 0 && $routeParams.imageId <= 2394) {
			    // ritter
			    $scope.imageStartValue = 0;
			    start = 0;
			    count = 2394;
			}
                        if ($routeParams.imageId >= 2395 && $routeParams.imageId <= 2835) {
			    // finin
			    $scope.imageStartValue = 2395;
                            start = 2395;
                            count = 441;
			}
                        if ($routeParams.imageId >= 2836 && $routeParams.imageId <= 4285) {
                            // msm
                            $scope.imageStartValue = 2836;
                            start = 2836;
                            count = 1450;
                        }
                        if ($routeParams.imageId >= 4286 && $routeParams.imageId <= 7665) {
			    // ramine
                            $scope.imageStartValue = 4286;
                            start = 4286;
                            count = 3380;
			}
		}


		$scope.imageSetSize = count;
		$scope.worker = resource.get({"route": "getWorker", "workersId": sgUser});
                if ($scope.worker.workers_id == null) {
                	$scope.worker = {"workers_id": sgUser + "_11", "workers_name": sgUser + "_11", "workers_points": 0, "workers_inc": 0, "workers_position": 0, "workers_last_image_id": 0};
                }

		$scope.workersScore = resource.get({"route": "getTextWorkersScores", "workersId": sgUser});
		$scope.badges = resource.query({"route": "getBadges"});
		$scope.levels = resource.query({"route": "getLevels"});
		$scope.images = resource.query({"route": $scope.requestMode, "start": start, "limit": count, "type": $scope.modeType});
		//$scope.activities = resource.query({"route": "getActivities", "limit": 5});
		$scope.activities = [];
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
                $scope.levelIcon = "level_newbie";
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
		$scope.seenGoldQuestion1 = false;
                $scope.seenGoldQuestion2 = false;
		$scope.image = {"image_name":"100000000000000000000000000000000000000000000000000000000000000000","tags":["asian","woman","windows","mouse","girl","keyboard","monitor"],"text_string":"loading ... please wait"};
		$scope.goldQuestion1 = {"text_string": "where is angela merkel from ? germany ?"};
                $scope.goldQuestion2 = {"text_string": "does the company Apple have a Mona Lisa painting ?"};
		$scope.workerTags = [];
		$scope.role = "player";
		$scope.incentiveParameters = {"incentives": [], "incentive": "", "workersInc": 0, "currentWorkersInc": 0, "target": 0, "message": ""};
		$scope.treasurePointsThreshold = 10;
                $scope.incentives = ["access", "power", "stuff", "leaderboard", "levels", "badges"];
		$scope.incentiveLikelihoods = [];

		$scope.incentiveBandLikelihoods = {"access": {"0-11": 0.1667, "12-60":0.4167, "61-100":0.25, "101-200": 0.0833, "201-": 0.0833},
			"badges": {"0-11": 0.0001, "12-60":0.3636, "61-100":0.0909, "101-200": 0.3636, "201-": 0.1818},
			"leaderboard": {"0-11": 0.1765, "12-60":0.1765, "61-100":0.0588, "101-200": 0.4117, "201-": 0.1765},
			"levels": {"0-11": 0.20, "12-60":0.40, "61-100":0.20, "101-200": 0.0667, "201-": 0.1333},
			"stuff": {"0-11": 0.25, "12-60":0.50, "61-100":0.125, "101-200": 0.125, "201-": 0.0001},
			"power": {"0-11": 0.1739, "12-60":0.3913, "61-100":0.2174, "101-200": 0.087, "201-": 0.1304}
		};

		$scope.incentivePriors = {"access": 0.1161, "power": 0.2609, "stuff": 0.1965, 
			"leaderboard": 0.1659, "levels": 0.1301, "badges": 0.1304};


		$scope.loadIncentiveLikelihoods = function() {
			var likelihood = null;

			for (var i in $scope.incentives) {
				likelihood = resource.get({"incentive": $scope.incentives[i], 
					"lowerBound": 0, "upperBound": $scope.imageSetSize, "route": "getProbabilities"});
				$scope.incentiveLikelihoods[$scope.incentives[i]] = likelihood;
			}

			likelihood.$promise.then(function() {
				setTimeout(function() {
	                                $scope.computeIncentives();
				}, 1000);
			});
		}

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

		$scope.getWorkerLevel = function(workersInc, getLevelId) {
			var levels = $scope.levels;

			for(var i = 0; i < levels.length; i++) {
				var level = levels[i];
				if((workersInc >= level.level_min) && (workersInc <= level.level_max)) {
					if (typeof getLevelId === "undefined") {
						return level;
					} else {
						return i;
					}
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

		$scope.imageIndex = null;
		$scope.getNextImage = function() {
			var insertGoldQuestion = function() {
                                if ($scope.seenGoldQuestion1 == false) {
                                        $scope.image = $scope.goldQuestion1;
                                }
                                if ($scope.workersScore.tagged_texts == 5 && $scope.seenGoldQuestion2 == false) {
                                        $scope.image = $scope.goldQuestion2;
                                }
			}
			
			if ($scope.worker.workers_inc == ($scope.imageSetSize - 1)) {
                                $scope.showGameOver();
                        }
			else {
				$scope.initializationStatus = "old";
				insertGoldQuestion();

				// We need to have the ImageSet ready
				$scope.images.$promise.then(function() {
					//console.log("$scope.imageIndex", $scope.imageIndex);
					if ($scope.imageIndex == null) {
						$scope.worker.workers_last_image_id = parseInt($scope.worker.workers_last_image_id) + 1;
						$scope.imageIndex = $scope.worker.workers_last_image_id;
					}
					//console.log("$scope.imageIndex", $scope.imageIndex);
					if ($scope.imageStartPoint == true) {
						$scope.imageIndex++;
					}

                                        if ($routeParams.imageId !== undefined && $scope.imageStartPoint == false) {
						//console.log("$routeParams.imageId", $routeParams.imageId);
						//console.log("$scope.imageStartValue", $scope.imageStartValue);
						if ($routeParams.imageId > $scope.imageIndex) {
							$scope.imageIndex = $routeParams.imageId - $scope.imageStartValue;
						}
						//console.log("$scope.imageIndex", $scope.imageIndex);
						$scope.images.slice($scope.imageIndex);
						/*var nextImages = $scope.images.slice($scope.imageIndex + 1);
						var prevImages = $scope.images.slice(0, $scope.imageIndex);
						nextImages.push.apply(nextImages, prevImages);
						for (var i = 0; i < nextImages.length; i++) {
							$scope.images[i] = nextImages[i];
						}*/
						$scope.imageStartPoint = true;
					}

					$scope.worker.workers_last_image_id = $scope.imageIndex;
					$scope.image = $scope.images[$scope.imageIndex];
					$scope.image.image_name = "spinner.gif";

					insertGoldQuestion();

					$scope.attempts = 0;
					$scope.counter = 0;
					$scope.dataPoints = [];
					$scope.setMaxValues();
					$scope.stopTimer();
					$scope.startTimer();
					$scope.getNextControlText();
					// $scope.checkMessageAlert("badges");
					
					var text_string = $scope.image.text_string;
					var text_array = text_string.split(" ");
					var new_array = [];
					var cleanString = function(text) {
						return text;
					}
					for (var i = 0; i < text_array.length; i++) {
						var current_text = cleanString(text_array[i]);
						current_string = "<span class='cursor-pointer' data-text='"+current_text+"' data-id='"+$scope.image.id+"' data-textid='"+i+"' ng-click='activatePlumb($event)'>" + current_text + "</span>";
						new_array.push(current_string);
					}
					$scope.image.text_string =  $sce.trustAsHtml(new_array.join(" "));
					$scope.cancelPlumb();
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
			
                        if ($scope.workerTags.length > 12) {
                                $scope.workerTags.splice(0,1);
                        }
		}

		$scope.viewInstructions = function() {
                        $scope.initializationStatus = "viewInstructions";
		}

		$scope.findRecentWorkerImages = function(workersId) {
			var taggedImage = {};
			
			if (typeof workersId === "undefined") {
				taggedImage.workersId = $scope.worker.workers_id;
			} else {
				taggedImage.workersId = workersId;
			}
			$scope.recentWorkerImages = [];

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

		$scope.addToActivitiesLog = function(worker, actionDone, actionObject, icon, hideBroadcast) {
			var activity = {};
			activity.workersId = $scope.worker.workers_id;
			activity.actionDone = actionDone;
			activity.actionObject = actionObject;
			activity.icon = icon;
			activity.route = "addActivity";
			activity.timestamp = new Date().getTime();

			var updatedActivity = resource.save(activity);

			if (typeof hideBroadcast === "undefined") {
                            updatedActivity.$promise.then(function() {
			//	socket.emit("addToActivitiesLog", updatedActivity);
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
                                //$scope.getWorkersParameters();
				//$scope.checkIncentivePromise();
				//socket.emit("updateLeaderboard", $scope.worker);
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
			$scope.incentiveParameters["currentWorkersInc"] = $scope.worker.workers_inc;
			
			if ($scope.incentiveParameters["incentive"] != "") {
				if (parseInt($scope.worker.workers_inc) > parseInt($scope.incentiveParameters["workersInc"])) {
					$scope.incentiveParameters["route"] = "updateIncentive";
                                        $ip = $scope.copyIncentivesParameters();

                                        resource.save($ip);
				}

				if (parseInt($scope.worker.workers_inc) 
					== (parseInt($scope.incentiveParameters["workersInc"]) + parseInt($scope.incentiveParameters["target"]))) {

					switch ($scope.incentiveParameters["incentive"]) {

					    case "access":
						$scope.treasurePointsThreshold = 5;

						alert("You now need 50% less tags to acquire 'Treasure Points' \n5 bonus points instead of 10");
						break;

                                            case "power":
						$scope.role = "master";

						alert("You can now view the last tags posted by a player \nClick anyone on 'The Leaderboard'");
                                                break;

                                            case "stuff":
						var bonusPayment = {};
                                		bonusPayment.workersId = $scope.worker.workers_id;
                                		bonusPayment.route = "payBonus";
                                		resource.save(bonusPayment);

						alert("5 cents bonus has been paid into your account");
                                                break;

                                            case "leaderboard":
						if ($scope.worker.workers_position == 1) {
							$scope.maxPoint = 10000;
							$scope.updateLeaderboardRecord();
						} 
						if ($scope.worker.workers_position > 1 && $scope.worker.workers_position <= 5) {
							$scope.moveWorkerToLeaderboardPosition($scope.worker.workers_position - 1);
						}
						if ($scope.worker.workers_position > 5) {
							$scope.moveWorkerToLeaderboardPosition(4);
						}

						alert("You have been fast-tracked up \nThe Global Leaderboard");
                                                break;

                                            case "levels":
						var currentLevelId = $scope.getWorkerLevel($scope.worker.workers_inc, "getLevelId");
						var nextLevel = $scope.levels[currentLevelId];
						var nextLevelMinimumWorkersInc = parseInt(nextLevel.level_max) + 2;
						$scope.worker.workers_inc = nextLevelMinimumWorkersInc;
						$scope.updateLeaderboardRecord();
	
						alert("You have been fast-tracked to \nThe Next Level");
						$scope.showStartNextLevel();
                                                break;

                                            case "badges":
						$scope.levelIcon = "level_ultimate";

						alert("You have been awarded the hidden \nUltimate Badge");
                                                break;
					}
					$scope.incentiveParameters["route"] = "redeemIncentive";
					$ip = $scope.copyIncentivesParameters();

					$scope.incentiveParameters["incentive"] = "";
					resource.save($ip);
				}
			}
		}

		$scope.copyIncentivesParameters = function() {
			var incentive = {};
			incentive["incentive"] = $scope.incentiveParameters["incentive"];
			incentive["route"] = $scope.incentiveParameters["route"];
			incentive["workersId"] = $scope.incentiveParameters["workersId"];
			incentive["workersInc"] = $scope.incentiveParameters["workersInc"];
                        incentive["currentWorkersInc"] = $scope.incentiveParameters["currentWorkersInc"];
			incentive["target"] = $scope.incentiveParameters["target"];

			return incentive;
		}

		$scope.moveWorkerToLeaderboardPosition = function(newPosition) {
			var competitor = $scope.leaderboard[ newPosition - 1 ];
			var competitorPoints = parseInt(competitor.workers_points);
			var workersPoints = parseInt($scope.worker.workers_points);
			var newPoints = (competitorPoints - workersPoints) + 1000;
			$scope.maxPoint = newPoints;
			$scope.updateLeaderboardRecord();
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
			//	$scope.showStartNextLevel();
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

			// $scope.loadIncentiveLikelihoods();
		}
		

		// INITIAL INITIALIZATION //
		$q.all([$scope.worker.$promise, $scope.levels.$promise, $scope.badges.$promise]).then(function() {
			$scope.initializationStatus = "new";
			$scope.getWorkersParameters();
			$scope.startGameTimer();
		});


		// SOCKET FUNCTIONS //
		/*
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
		*/
		
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
				var style = '-moz-radial-gradient('+x+'px '+y+'px 45deg, circle closest-side,transparent 0,transparent 100px,rgba(0, 0, 0, 0.8) 120px)';
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
		$scope.totalInstructions = 5;
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

		$scope.calculateMAP = function(numImagesTagged) {
			var posteriors = [];
			var band = "";
 
			if (numImagesTagged == 11) {
				band = "0-11";
			} else if (numImagesTagged >= 12 && numImagesTagged <= 60) {
				band = "12-60";
                        } else if (numImagesTagged >= 61 && numImagesTagged <= 100) {
                                band = "61-100";
                        } else if (numImagesTagged >= 101 && numImagesTagged <= 200) {
                                band = "101-200";
                        } else if (numImagesTagged >= 201) {
                                band = "201-";
                        } 

			for (var i in $scope.incentives) {	
				var incentivePrior = $scope.incentivePriors[$scope.incentives[i]];
				var incentiveLikelihood = $scope.incentiveLikelihoods[$scope.incentives[i]][numImagesTagged + "_"];
				var likelihoodProbability = incentiveLikelihood["positive"] / incentiveLikelihood["total"];
				var incentiveBandLikelihood = $scope.incentiveBandLikelihoods[$scope.incentives[i]][band];

				var posterior = incentivePrior * incentiveBandLikelihood * likelihoodProbability;
				var posteriorObject = {};
				posteriorObject[$scope.incentives[i]] = posterior;
				posteriors.push(posteriorObject);
			}
			
			var sortable = [];
			for (var i in posteriors) {
				for (incentive in posteriors[i]) {
					sortable.push([incentive, posteriors[i][incentive]]);
				}
			}
			sortable.sort(function(a, b) {return b[1] - a[1]});
			
			return sortable;
		}

		$scope.computeIncentives = function() {
			$scope.computedIncentives = {};

                        // maps keeps track on how many incentives has been mapped, e.g, don't assign more than 26% to power
                        var priorsTracker = {"access": 0, "badges": 0, "leaderboard": 0, "levels": 0, "stuff": 0, "power": 0};
                        var min = 11;
                        var max = 500;

                        for (var i = min; i < max; i++) {
                                var posteriorProbs = $scope.calculateMAP(i);
                                var incentiveId = 0;
                                var selectedIncentive = posteriorProbs[incentiveId][0];

                                var isValidIncentive  = function(priorsTracker, posteriorProbs, incentiveId, min, max) {
                                        selectedIncentive = posteriorProbs[incentiveId][0];
                                        if ( priorsTracker[selectedIncentive] < ($scope.incentivePriors[selectedIncentive] * (max - min)) ) {
                                                return true;
                                        }
                                };

                                var isValid = false;
                                for (var j = 0; j < $scope.incentives.length; j++) {
                                        incentiveId = j;
                                        if ( !isValid && isValidIncentive(priorsTracker, posteriorProbs, incentiveId, min, max) ) {
                                                selectedIncentive = posteriorProbs[incentiveId][0];
                                                priorsTracker[selectedIncentive] += 1;
                                                isValid = true;
						$scope.computedIncentives[i] = posteriorProbs[incentiveId][0];
                                                // console.log("Num: ", i, "map is: ", posteriorProbs[incentiveId][0]);
                                        }
                                }
                        }
		}

		$scope.hideFurtheranceIncentive = function() {
			$scope.getNextImage();
			$("#overlay").hide();
			$(".middle-background").css("background-image", "url(../app/img/bg1.jpg)");
		}

		// var currentMousePosition = {"x": -1, "y": -1};
		$scope.incentiveMessageCluster = ["","","","","",""];
		$scope.hasSeenIncentivePopup = "no";

		/*
		$(document).mousemove(function(event) {
			currentMousePosition.x = event.pageX;
			currentMousePosition.y = event.pageY;

			if (currentMousePosition.y < 30 && $scope.worker.workers_inc >= 11 && $scope.initializationStatus != "incentivize" && $scope.hasSeenIncentivePopup == "no") {

				$scope.initializationStatus  = "incentivize";
				$scope.hasSeenIncentivePopup = "yes";
				$("#overlay").show();
				$(".middle-background").css("background-image", "none");
				
				$scope.triggerFurtheranceIncentive(null);
			}
		
		});
		*/

                var currentDataPoint = {"x": -1, "y": -1, "value": -1};
                var pageHeight = $(window).height();
                var pageWidth = $(window).width();
                var canvasHeight = 423;
                var canvasWidth = 1366;
		var dataPointCounter = 0;
		$scope.dataPoints = [];

                $(document).mousemove(function(event) {
			dataPointCounter++;
			if (dataPointCounter % 10 == 0) {
				$scope.dataPoints.push({
					"x": parseInt((event.pageX/pageWidth) * canvasWidth), 
					"y": parseInt((event.pageY/pageHeight) * canvasHeight), 
					"value": Math.floor(Math.random()*100)
				});
			}
                });

		window.onbeforeunload = function (event) {
			// $scope.triggerFurtheranceIncentive(event);
		}

		$scope.triggerFurtheranceIncentive = function(event) {
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
			var incentives = $scope.incentives;
			var targetImages = 11;
			if (numImagesTagged < 21) {
			    targetImages = 5;
			}
 
			var msg3 = ["Would you like to tag the next " + targetImages + " images? \nYou would automatically be advanced on \nThe Global Leaderboard", "Get to Lead", "Leader", "get seen", "globally on", "the leaderboard"];
			var msg4 = ["Would you like to tag the next " + targetImages + " images? \nYou would automatically be advanced to \nThe Next Level", "Next Level", "Levels", "automatically", "advance to the", "next level"];
			var msg5 = ["Would you like to tag the next " + targetImages + " images? \nYou would automatically be rewarded with \nThe 'Ultimate' Badge", "Get Avatar", "Avatar", "get upgraded", "to a shiny", "new avatar"];

			var msg0 = ["Would you like to tag the next " + targetImages + " images? \nYou would be given quicker access to \nTreasure Points", "Get Access", "Access", "beat the queues", "get more treasure", "in half the time"];
			var msg1 = ["Would you like to tag the next " + targetImages + " images? \nYou would be rewarded with the power to \nView Other Players Tags", "Get Power", "Power", "to see", "other players'", "image tags"];
			var msg2 = ["Would you like to tag the next " + targetImages + " images? \nYou would be rewarded with a bonus of \n5 cents extra", "Get Money", "Money", "more cash", "for your", "effort"];

			var randomIncentive = Math.floor(Math.random() * 6);
			var incentiveMessages = [msg0, msg1, msg2, msg3, msg4, msg5];
                        if (typeof event == 'undefined') {
                            event = window.event;
                        }

			var incentiveOffered = incentives[randomIncentive];
			try {
			    incentiveOffered = $scope.computedIncentives[numImagesTagged];
			    // console.log("Incentive offered at ", numImagesTagged, " is ", incentiveOffered);
			} catch (e) {
				console.log(e);
			}
			
			$scope.incentiveMessageCluster = incentiveMessages[incentives.indexOf(incentiveOffered)];

			// $scope.incentiveParameters["incentives"] = $scope.incentiveParameters["incentives"].push(incentiveOffered);
			$scope.incentiveParameters["incentive"] = incentiveOffered;
			$scope.incentiveParameters["workersInc"] = $scope.worker.workers_inc;
                        $scope.incentiveParameters["currentWorkersInc"] = $scope.worker.workers_inc;
			$scope.incentiveParameters["target"] = targetImages;
			$scope.incentiveParameters["workersId"] = $scope.worker.workers_id;
			$scope.incentiveParameters["message"] = $scope.incentiveMessageCluster[0];
			$scope.incentiveParameters["route"] = "startIncentive";
                        $ip = $scope.copyIncentivesParameters();
			resource.save($ip);

			// $scope.addToActivitiesLog($scope.worker, "was offered", incentiveOffered, "coin.png", "hideBroadcast");
                        if (event) {
                            event.returnValue = $scope.incentiveMessageCluster[0] + "\n";
                        }
                        return message;
		    }
		};


		$scope.showDescription = function(id) {
			$(".description").hide();
			$("#entity_" + id + "_description").show();
		}

		$scope.detachEntity = function(id) {
			$("#div_" + id).remove();
		}

		$scope.cancelPlumb = function() {
			$("#named_entity span").text("");
			$scope.lastEntityId  = "";
			$scope.currentEntity = "";
			$scope.userCurrentEntities = "";
			$(".view-entities").hide();
		}

                $scope.submitPlumb = function() {
			var annotateString = $("#annotate").text();
			var annotateWords  = annotateString.split(" ");
			var annotateId     = $($("#annotate span")[0]).data("id");

			var annotation = {};
			annotation.id  = annotateId;
			annotation.textString = annotateString;

			var entities = [];
			var entity_count = 0;
			for (var i = 0; i < annotateWords.length; i++) {
				var entity = {};
				var entityId = annotateId + "_" + i;
				if ( $("#entity_value_" + entityId).length > 0 ) {
					entity.entity_value = $("#entity_value_" + entityId).text();
					entity.entity_type = $("#entity_type_" + entityId).text();
					entity.position = i;
					entity_count += 1;
					entities.push(entity);
				}
			}

			var clearPlumb = function() {
                                $("#named_entity span").text("");
                                $scope.lastEntityId  = "";
                                $scope.currentEntity = "";
                                $scope.userCurrentEntities = "";
                                $("#statemachine-demo").hide();
                                $scope.getNextImage();
			}

			var verifyGoldQuestion = function(annotation) {
				var goldStatus = "not_gold";
                                if ($scope.seenGoldQuestion1 == false) {
                                        goldStatus = $scope.verifyGold(annotation);
                                        if (goldStatus == "failed") {
                                                alert("Your answers were wrong, try again");
						$scope.cancelPlumb();
                                        } else {
                                                $scope.seenGoldQuestion1 = true;
						clearPlumb();
                                        }
                                }
                               
                                if ($scope.workersScore.tagged_texts == 5 && $scope.seenGoldQuestion2 == false) {
                                        goldStatus = $scope.verifyGold(annotation);
                                        if (goldStatus == "failed") {
                                                alert("Your answers were wrong, try again");
						$scope.cancelPlumb();
                                        } else {
                                                $scope.seenGoldQuestion2 = true;
						clearPlumb();
                                        }
                                }
                                return goldStatus;
			}

			var makeCRCTable = function(){
			    var c;
			    var crcTable = [];
			    for(var n =0; n < 256; n++){
				c = n;
				for(var k =0; k < 8; k++){
				    c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
				}
				crcTable[n] = c;
			    }
			    return crcTable;
			}

			var crc32 = function(str) {
			    var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
			    var crc = 0 ^ (-1);

			    for (var i = 0; i < str.length; i++ ) {
				crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
			    }

			    return (crc ^ (-1)) >>> 0;
			};

			if (entity_count > 0) {
				annotation.entities = entities;
				annotation.entityCount = entity_count;
				annotation.workersId = $scope.worker.workers_id;
				annotation.timeTaken = $scope.counter;
				annotation.dataPoints = $scope.dataPoints;
				annotation.route = "addUserText";
				
				var goldStatus = verifyGoldQuestion(annotation);
				if (goldStatus != "not_gold") return false;
				
				resource.save(annotation);
				$scope.workersScore.tagged_texts = parseInt($scope.workersScore.tagged_texts) + 1;
				$scope.workersScore.entities_found = parseInt($scope.workersScore.entities_found) + entity_count;
				if ($scope.workersScore.tagged_texts == 10) {
					//var exitCodes = ["wEdS12fG55", "xCbV67hJ33", "pKmH99uY77"];
					//var codeIndex = Math.floor(Math.random() * 3);
					var codeIndex = crc32($routeParams.imageId);
					$("#exit-code").show();
                                        $("#exit-code-span").html(codeIndex);
				}	
                                $scope.updateLeaderboardRecord();

                                if (($scope.worker.workers_inc+1) == ($scope.imageSetSize - 1)) {
                                	$scope.showGameOver();
                                } else {
                                	clearPlumb();
                                }
			}
			else {
				if (confirm("No entities found, continue to next text?")) {
					clearPlumb();
				}
			}
                }

		$scope.verifyGold = function(annotation) {
			if (annotation.entityCount != 2) {
				return "failed";
			}
			for (var i = 0; i < 2; i++) {
				if ( (annotation.entities[i]["entity_value"] != "angela merkel") && 
					(annotation.entities[i]["entity_value"] != "germany") &&
					(annotation.entities[i]["entity_value"] != "Apple") &&
					(annotation.entities[i]["entity_value"] != "Mona Lisa")) {
					return "failed";
				}
				if (annotation.entities[i]["entity_value"] == "angela merkel") {
					if (annotation.entities[i]["entity_type"] != "person") {
						return "failed";
					}
				}
                                if (annotation.entities[i]["entity_value"] == "germany") {
                                        if (annotation.entities[i]["entity_type"] != "location") {
                                                return "failed";
                                        }
                                }
                                if (annotation.entities[i]["entity_value"] == "Apple") {
                                        if (annotation.entities[i]["entity_type"] != "organisation") {
                                                return "failed";
                                        }
                                }
                                if (annotation.entities[i]["entity_value"] == "Mona Lisa") {
                                        if (annotation.entities[i]["entity_type"] != "miscellaneous") {
                                                return "failed";
                                        }
                                }
			}
			return "succeed";
		}

		/*
		var makeCRCTable = function(){
		    var c;
		    var crcTable = [];
		    for(var n =0; n < 256; n++){
			c = n;
			for(var k =0; k < 8; k++){
			    c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
			}
			crcTable[n] = c;
		    }
		    return crcTable;
		}

		var crc32 = function(str) {
		    var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
		    var crc = 0 ^ (-1);

		    for (var i = 0; i < str.length; i++ ) {
			crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
		    }

		    return (crc ^ (-1)) >>> 0;
		};
		*/

		$scope.userCurrentEntities = "";
		$scope.currentEntity = "";
		$scope.lastEntityId = "";
		$scope.plumbActivated = false;
		$scope.allEntityTypes = "person, organisation, location, miscellaneous";

		$scope.activatePlumb = function(e) {
			var clickedId = $(e.target).data('id');
			var clickedText = $(e.target).data('text');
			var clickedTextId = $(e.target).data('textid');

			$scope.lastEntityId = clickedId + "_" + clickedTextId;
			$scope.currentEntity = $.trim($scope.currentEntity + " " + clickedText);
			$("#named_entity span").text($scope.currentEntity);
			$(".view-entities").show();
			$("#mid-instructions").html("Drag the <span class='bold'>black</span> (entity word) dot to the corresponding <span class='bold'>yellow</span> (entity type) dot");

			if (window.jsp !== undefined) {
				var connections = window.jsp.getConnections({source: "named_entity"});
				if (connections.length > 0) {
					window.jsp.detach(connections[0]);
				}
			}

			if ($scope.plumbActivated == false) {
                                $scope.doActivatePlumb();
			}
		}

		$scope.doActivatePlumb = function() {
			$scope.plumbActivated = true;

			var instance = jsPlumb.getInstance({
				Endpoint : ["Dot", {radius:2}],
				HoverPaintStyle : {strokeStyle:"#1e8151", lineWidth:2 },
				ConnectionOverlays : [
					[ "Arrow", {
						location:2,
						id:"arrow",
				length:14,
				foldback:0.8
					} ],
			    [ "Label", { label:"IS A", id:"label", cssClass:"aLabel" }]
				],
				Container:"statemachine-demo"
			});

			window.jsp = instance;

			var sources = jsPlumb.getSelector(".statemachine-demo .sources");
			var targets = jsPlumb.getSelector(".statemachine-demo .targets");

			instance.draggable(targets);

			instance.bind("click", function(c) {
				$scope.detachEntity($scope.lastEntityId);
				instance.detach(c);
			});

			instance.bind("connection", function(info) {
				// console.log(info.sourceId, info.targetId, info.source, info.target);
				var connections = instance.getConnections({source: "named_entity"});
				if (connections.length > 1) {
					instance.detach(connections[0]);
				}
				var current_entity_target = (info.targetId).replace("entity_", "");
				var vowels  = ["a", "e", "i", "o", "u"];
				var isAorAn = " IS A ";
				if (vowels.indexOf(current_entity_target.charAt(0)) != -1) {
					isAorAn = " IS AN ";
				}

				var current_entity  = "<span id='entity_value_" + $scope.lastEntityId + "'>" + $("#named_entity span").text() + "</span>" +
					"<span class='bold'>" + isAorAn + "</span>" + 
					"<span id='entity_type_" + $scope.lastEntityId + "'>" + current_entity_target + "</span>";

				if ($("#div_" + $scope.lastEntityId).length > 0) {
					$("#div_" + $scope.lastEntityId).remove();
				}
				var user_current_entities = $("#user_current_entities").html();
				$scope.userCurrentEntities = $sce.trustAsHtml(user_current_entities + 
					"<div id='div_"+ $scope.lastEntityId +"'><span id='span_" + $scope.lastEntityId + 
					"' class='cancel-plumb cursor bold' ng-click='detachEntity(\"" + $scope.lastEntityId + "\")'>[X]</span>&nbsp;" + 
					current_entity + "</div>");

				info.connection.getOverlay("label").setLabel(isAorAn);
				$("#mid-instructions").html("Click and connect another word or hit the <span class='bold'>Submit</span> button to finish tagging this sentence");
				$scope.currentEntity = "";
			});

			instance.doWhileSuspended(function() {
				var isFilterSupported = instance.isDragFilterSupported();
				if (isFilterSupported) {
					instance.makeSource(sources, {
						filter:".ep",
						anchor:"Continuous",
						connector:[ "StateMachine", { curviness:20 } ],
						connectorStyle:{ strokeStyle:"#333", lineWidth:2, outlineColor:"transparent", outlineWidth:4 },
						maxConnections:1,
						onMaxConnections:function(info, e) {
							alert("Maximum connections (" + info.maxConnections + ") reached");
						}
					});
				}
			});

			instance.makeTarget(targets, {
				dropOptions:{ hoverClass:"dragHover" },
				anchor:"Continuous",
				allowLoopback:false
			});
			jsPlumb.fire("jsPlumbDemoLoaded", instance);
		}

	}
])
.directive('compileTemplate', function($compile, $parse){
    return {
        link: function(scope, element, attr){
            var parsed = $parse(attr.ngBindHtml);
            function getStringValue() { return (parsed(scope) || '').toString(); }

            //Recompile if the template changes
            scope.$watch(getStringValue, function() {
                $compile(element, null, -9999)(scope);  //The -9999 makes it skip directives so that we do not recompile ourselves
            });
        }         
    }
});
// http://www.jsplumb.org/demo/statemachine/dom.html
// http://stackoverflow.com/questions/20297638/call-function-inside-sce-trustashtml-string-in-angular-js
