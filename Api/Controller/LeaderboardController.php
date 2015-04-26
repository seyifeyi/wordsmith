<?php

require_once "../CoreDomain/Leaderboard/Leaderboard.php";
require_once "../Infrastructure/LeaderboardRepository.php";

class LeaderboardController
{
	private $leaderboardRepository;

	public function __construct() 
	{
		$this->leaderboardRepository = new LeaderboardRepository();
	}

	public function newLeaderboardRecord($request)
	{
                $workersId = $request["workersId"];
                $workersName = $request["workersName"];
                $workersPass = $request["workersPass"];
                $workersCode = $request["workersCode"];

		$leaderboard = new Leaderboard($workersId, $workersName, $workersPass, $workersCode);
		$leaderboard = $this->leaderboardRepository->newLeaderboardRecord($leaderboard);

		return $leaderboard->toJson();
	}

        public function updateLeaderboardRecord($request)
        {
                $workersId = $request["workersId"];
                $points = $request["points"];
		$lastImageId = $request["workersLastImageId"];

		$leaderboard = $this->leaderboardRepository->getLeaderboardRecordById($workersId);
		$leaderboard->incrementWorkersPoints($points);
		$leaderboard->incrementWorkersInc(1);
		$leaderboard->setWorkersLastImageId($lastImageId);

                $leaderboard = $this->leaderboardRepository->updateLeaderboardRecord($leaderboard);

                return $leaderboard->toJson();
        }

        public function getLeaderboardRecordById($request)
        {   
                $workersId = $request["workersId"];
                $leaderboard = $this->leaderboardRepository->getLeaderboardRecordById($workersId);
		if($leaderboard == null) {
			$leaderboard = new Leaderboard(null, null, null, null);
		}

                return $leaderboard->toJson();
        }

	public function getLeaderboardPosition($request) {
                $workersId = $request["workersId"];
                $position = $this->leaderboardRepository->getLeaderboardPosition($workersId);
		$leaderboard = new Leaderboard($workersId, null, null, null);
		$leaderboard->setWorkersPosition($position);

                return $leaderboard->toJson();
	}

	public function getTopLeaderboardRecords($request)
	{
		$limit = $request["limit"];
		$cutoff = $request["cutoff"];
		$leaderboards = $this->leaderboardRepository->getTopLeaderboardRecords($limit, $cutoff);
		$top = array();
		foreach($leaderboards as $leaderboard) {
			$top[] = $leaderboard->toJson();
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
