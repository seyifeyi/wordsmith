<?php

class Leaderboard
{
	private $workersId;

	private $workersName;

	private $workersPass;

	private $workersPoints;

	private $workersInc;

	private $workersCode;

	private $workersPosition;

	private $workersLastImageId;
	
	public function __construct($workersId, $workersName, $workersPass, $workersCode) 
	{
		$this->workersId = $workersId;
		$this->workersName = $workersName;
		$this->workersPass = $workersPass;
		$this->workersCode = $workersCode;
		$this->workersInc = 0;
		$this->workersPoints = 0;
		$this->workersPosition = 0;
		$this->workersLastImageId = 0;
	}

	public function getWorkersId() 
	{
		return $this->workersId;
    	}

	public function getWorkersName()
	{
		return $this->workersName;
	}

	public function getWorkersPass() 
	{
		return $this->workersPass;
	}

	public function getWorkersCode()
	{
		return $this->workersCode;
	}

        public function getWorkersInc()
        {
                return $this->workersInc;
        }

        public function getWorkersPoints()
        {
                return $this->workersPoints;
        }

        public function getWorkersPosition()
        {
                return $this->workersPosition;
        }

	public function getWorkersLastImageId()
	{
		return $this->workersLastImageId;
	}

        public function setWorkersPosition($workersPosition)
        {
                $this->workersPosition = $workersPosition;
        }

	public function setWorkersLastImageId($workersLastImageId)
	{
		$this->workersLastImageId = $workersLastImageId;
	}

	public function incrementWorkersPoints($factor)
	{
		$this->workersPoints = $this->workersPoints + $factor;
	}

	public function incrementWorkersInc($factor)
	{
		$this->workersInc = $this->workersInc + $factor;
	}

        public function toJson()
        {
                $object = array();
                $object["workers_id"] = $this->workersId;
                $object["workers_name"] = $this->workersName;
		$object["workers_points"] = $this->workersPoints;
		$object["workers_inc"] = $this->workersInc;
		$object["workers_position"] = $this->workersPosition;
		$object["workers_last_image_id"] = $this->workersLastImageId;

                return json_encode($object);
        }
}
