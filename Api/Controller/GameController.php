<?php

require_once "../CoreDomain/Leaderboard/Leaderboard.php";
require_once "../Infrastructure/LeaderboardRepository.php";
require_once "../CoreDomain/Image/Image.php";
require_once "../Infrastructure/ImageRepository.php";
require_once "../Infrastructure/TextRepository.php";
require_once "../Infrastructure/UserTextRepository.php";
require_once "../CoreDomain/Badge/Badge.php";
require_once "../Infrastructure/BadgeRepository.php";
require_once "../CoreDomain/Badge/Level.php";
require_once "../Infrastructure/LevelRepository.php";

class GameController
{
	private $leaderboardRepository;
	private $imageRepository;
	private $badgeRepository;
	private $levelRepository;

	public function __construct() 
	{
		$this->leaderboardRepository = new LeaderboardRepository();
                $this->userTextRepository    = new UserTextRepository();
		$this->imageRepository = new ImageRepository();
		$this->textRepository  = new TextRepository();
		$this->badgeRepository = new BadgeRepository();
		$this->levelRepository = new LevelRepository();
	}

        public function login($request)
        {   
                $workersId = $request["workersId"];
		$workersPass = $request["workersPass"];
                $leaderboard = $this->leaderboardRepository->getLeaderboardRecordById($workersId);
		if($leaderboard->getWorkersPass() == $workersPass) {
			return $leaderboard->toJson();
		}
                return null;
        }

	public function getImageSet($request)
	{
		$limit = $request["limit"];
		$images = $this->imageRepository->getImageSet($limit);
		$array = array();
		foreach($images as $image) {
			$array[] = $image->toJson();
		}
	
		return $this->collectionAsJson($array);
	}

        public function getTextSet($request)
        {
                $limit = $request["limit"];
		$start = $request["start"];
                $texts = $this->textRepository->getTextSet($start, $limit);
                $array = array();
                foreach($texts as $text) {
                        $array[] = $text->toJson();
                }

                return $this->collectionAsJson($array);
        }

	public function getDataPoints($request)
	{
		//$workersId = $request["workersId"];
		$dataPoints = $this->userTextRepository->getDataPoints();
		
		return json_encode($dataPoints);
	}

	public function getBadges($request)
	{
		$badges = $this->badgeRepository->getBadges();
                $array = array();
                foreach($badges as $badge) {
                        $array[] = $badge->toJson();
                }

                return $this->collectionAsJson($array);
	}

	public function getLevels($request)
	{
                $levels = $this->levelRepository->getLevels();
                $array = array();
                foreach($levels as $level) {
                        $array[] = $level->toJson();
                }

                return $this->collectionAsJson($array);
	}

	private function collectionAsJson($collection)
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
