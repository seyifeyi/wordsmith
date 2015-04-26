<?php

$request = array();

if(isset($_GET["route"])) {
	$request = $_REQUEST;
} else {
	$body = file_get_contents("php://input");
	$body_params  = json_decode($body);
	if($body_params) {
		foreach($body_params as $param_name => $param_value) {
			$request[$param_name] = $param_value;
		}
	}
}

switch ($request["route"]) {
	case "getBadges":
		require_once "Controller/GameController.php";
		$gameController = new GameController();
		echo $gameController->getBadges($request);
		break;

        case "getLevels":
                require_once "Controller/GameController.php";
                $gameController = new GameController();
                echo $gameController->getLevels($request);
                break;

        case "getImageSet":
                require_once "Controller/GameController.php";
                $gameController = new GameController();
                echo $gameController->getImageSet($request);
                break;

        case "getWorker":
                require_once "Controller/LeaderboardController.php";
		$leaderboardController = new LeaderboardController();
                echo $leaderboardController->getLeaderboardRecordById($request);
                break;

        case "newLeaderboardRecord":
                require_once "Controller/LeaderboardController.php";
                $leaderboardController = new LeaderboardController();
                echo $leaderboardController->newLeaderboardRecord($request);
                break;

        case "updateLeaderboardRecord":
                require_once "Controller/LeaderboardController.php";
                $leaderboardController = new LeaderboardController();
                echo $leaderboardController->updateLeaderboardRecord($request);
                break;

        case "getTopLeaderboardRecords":
                require_once "Controller/LeaderboardController.php";
                $leaderboardController = new LeaderboardController();
                echo $leaderboardController->getTopLeaderboardRecords($request);
                break;

        case "getLeaderboardPosition":
                require_once "Controller/LeaderboardController.php";
                $leaderboardController = new LeaderboardController();
                echo $leaderboardController->getLeaderboardPosition($request);
                break;

        case "findImageById":
                require_once "Controller/ImageController.php";
                $imageController = new ImageController();
                echo $imageController->findImageById($request);
                break;

        case "findImageByName":
                require_once "Controller/ImageController.php";
                $imageController = new ImageController();
                echo $imageController->findImageByName($request);
                break;

        case "addUserImage":
		require_once "Controller/UserImageController.php";
                $userImageController = new UserImageController();
                echo $userImageController->addUserImage($request);
                break;

        case "findRecentWorkerImages":
                require_once "Controller/UserImageController.php";
                $userImageController = new UserImageController();
                echo $userImageController->findRecentWorkerImages($request);
                break;

        case "isValidEnglishString":
                require_once "Controller/UserImageController.php";
                $userImageController = new UserImageController();
                echo $userImageController->isValidEnglishString($request);
                break;

        case "addActivity":
                require_once "Controller/ActivityController.php";
                $activityController = new ActivityController();
                echo $activityController->addActivity($request);
                break;

        case "getActivities":
                require_once "Controller/ActivityController.php";
                $activityController = new ActivityController();
                echo $activityController->getActivities($request);
                break;

        case "payBonus":
                require_once "Controller/BonusPaymentController.php";
                $bonusPaymentController = new BonusPaymentController();
                echo $bonusPaymentController->applyBonusPayment($request);
                break;

        case "startIncentive":
                require_once "Controller/IncentiveController.php";
                $incentiveController = new IncentiveController();
                echo $incentiveController->startIncentive($request);
                break;

        case "updateIncentive":
                require_once "Controller/IncentiveController.php";
                $incentiveController = new IncentiveController();
                echo $incentiveController->updateIncentive($request);
                break;

        case "redeemIncentive":
                require_once "Controller/IncentiveController.php";
                $incentiveController = new IncentiveController();
                echo $incentiveController->redeemIncentive($request);
                break;

        case "getProbabilities":
                require_once "Controller/IncentiveController.php";
                $incentiveController = new IncentiveController();
                echo $incentiveController->getProbabilities($request);
                break;

        case "getTextSet":
                require_once "Controller/GameController.php";
                $gameController = new GameController();
                echo $gameController->getTextSet($request);
                break;

        case "getDataPoints":
                require_once "Controller/GameController.php";
                $gameController = new GameController();
                echo $gameController->getDataPoints($request);
                break;

        case "addUserText":
                require_once "Controller/UserTextController.php";
                $userTextController = new UserTextController();
                echo $userTextController->addUserText($request);
                break;

	case "getTextWorkersScores":
                require_once "Controller/UserTextController.php";
                $userTextController = new UserTextController();
                echo $userTextController->getTextWorkersScores($request);
                break;
}
