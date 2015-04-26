<?php

require_once "../CoreDomain/Activity/Activity.php";
require_once "../Infrastructure/ActivityRepository.php";

class BonusPaymentController
{
	private $activityRepository;
	private $apiKey;

	public function __construct() 
	{
		$this->activityRepository = new ActivityRepository();
		$this->apiKey = "sezmzdym_Dq-RzRPDbSx";
		$this->jobId = "627484";
	}

	public function payBonus($request)
	{
		$workersId = $request["workersId"];

		$url  = "https://api.crowdflower.com/v1/jobs/" . $this->jobId . "/workers/" . $workersId . "/bonus.json?key=" . $this->apiKey;
		$ch = curl_init();
		curl_setopt($ch,CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, "amount=5");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		$result = curl_exec($ch);
		curl_close($ch);

		$activityWorkersId  = $workersId;
		$activityActionDone = " just earned ";
		$activityActionObject = " 5cents bonus cash ";
		$activityIcon = "money";
		$activityTimestamp = time();

		$activity = new Activity($activityWorkersId, $activityActionDone, $activityActionObject, $activityIcon);
                $activity->setDatetime(time());
                $activity->setTimestamp($activityTimestamp);

		$activity = $this->activityRepository->addActivity($activity);

                return $activity->toJson();
	}

/*
	public function addActivity($request)
	{
                $workersId = $request["workersId"];
                $actionDone = $request["actionDone"];
                $actionObject = $request["actionObject"];
                $icon = $request["icon"];
		$timestamp = $request["timestamp"];

		$activity = new Activity($workersId, $actionDone, $actionObject, $icon);
		$activity->setDatetime(time());
		$activity->setTimestamp($timestamp);
		$activity = $this->activityRepository->addActivity($activity);

		return $activity->toJson();
	}

	public function getActivities($request)
	{
		$limit = $request["limit"];
		$activities = $this->activityRepository->getActivities($limit);
		$top = array();
		foreach($activities as $activity) {
			$top[] = $activity->toJson();
		}
	
		return $this->collectionAsJson($top);
	}

	public function collectionAsJson($collection)
	{
		$json = "[";
		foreach($collection as $jsonString) {
			$json = $json . $jsonString . ",";
		}
		$json = substr($json, 0, strlen($json) - 1);
		$json .= "]";

		return $json;
	}
*/
}
