<?php

require_once "../CoreDomain/Activity/Activity.php";
require_once "../Infrastructure/ActivityRepository.php";

class ActivityController
{
	private $activityRepository;

	public function __construct() 
	{
		$this->activityRepository = new ActivityRepository();
	}

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
}
