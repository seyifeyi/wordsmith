<?php

class Level
{
	const NEWBIE = "newbie";
	const NOVICE = "novice";
	const COMPETENT = "competent";
	const MASTER = "master";
	const CHAMPION = "champion";

	private $levelMin;

	private $levelMax;

	private $levelRank;
	
	public function __construct($levelMin, $levelMax, $levelRank) 
	{
		$this->levelMin = $levelMin;
		$this->levelMax = $levelMax;
		$this->levelRank = $levelRank;
	}

	public function getLevelMin() 
	{
		return $this->levelMin;
    	}

	public function getLevelMax() 
	{
		return $this->levelMax;
	}

	public function getLevelRank() 
	{
		return $this->levelRank;
	}

	public function toJson()
	{
		$object = array();
		$object["level_min"] = $this->levelMin;
		$object["level_max"] = $this->levelMax;
		$object["level_rank"] = $this->levelRank;

		return json_encode($object);
	}
}
