<?php

class Badge
{
	private $badgeUrl;

	private $workerInc;

	private $badgeName;
	
	public function __construct($badgeUrl, $workersInc, $badgeName) 
	{
		$this->badgeUrl = $badgeUrl;
		$this->workersInc = $workersInc;
		$this->badgeName = $badgeName;
	}

	public function getBadgeUrl() 
	{
		return $this->badgeUrl;
    	}

	public function getWorkersInc() 
	{
		return $this->workersInc;
	}

	public function getBadgeName() 
	{
		return $this->badgeName;
	}

	public function toJson()
	{
		$object = array();
		$object["badge_url"] = $this->badgeUrl;
		$object["workers_inc"] = $this->workersInc;
		$object["badge_name"] = $this->badgeName;

		return json_encode($object);
	}
}
