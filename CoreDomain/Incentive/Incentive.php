<?php

class Incentive
{
	private $workersId;

	private $workersInc;

	private $currentWorkersInc;

	private $target;

	private $incentiveType;

	private $creationDate;

	private $redemptionDate;
	
	public function __construct($workersId, $workersInc, $target, $incentiveType) 
	{
		$this->workersId = $workersId;
		$this->workersInc = $workersInc;
		$this->currentWorkersInc = $workersInc;
		$this->target = $target;
		$this->incentiveType = $incentiveType;
	}

	public function getWorkersId() 
	{
		return $this->workersId;
    	}

	public function getWorkersInc()
	{
		return $this->workersInc;
	}

        public function getCurrentWorkersInc()
        {
                return $this->currentWorkersInc;
        }

	public function getTarget()
	{
		return $this->target;
	}

	public function getIncentiveType()
	{
		return $this->incentiveType;
	}

        public function getCreationDate()
        {
                return $this->creationDate;
        }

        public function getRedemptionDate()
        {
                return $this->redemptionDate;
        }

        public function setWorkersId($workersId)
        {
                $this->workersId = $workersId;
        }

	public function setWorkersInc($workersInc)
	{
		$this->workersInc = $workersInc;
	}

        public function setCurrentWorkersInc($currentWorkersInc)
        {
                $this->currentWorkersInc = $currentWorkersInc;
        }

	public function setTarget($target)
	{
		$this->target = $target;
	}

	public function setIncentiveType($incentiveType)
	{
		$this->incentiveType = $incentiveType;
	}

        public function setCreationDate($creationDate)
        {
                $this->creationDate = $creationDate;
        }

        public function setRedemptionDate($redemptionDate)
        {
                $this->redemptionDate = $redemptionDate;
        }

        public function toJson()
        {
                $object = array();
                $object["workers_id"] = $this->workersId;
                $object["workers_inc"] = $this->workersInc;
                $object["current_workers_inc"] = $this->currentWorkersInc;
		$object["target"] = $this->target;
		$object["incentive_type"] = $this->incentiveType;
		$object["creation_date"] = $this->creationDate;
		$object["redemption_date"] = $this->redemptionDate;

                return json_encode($object);
        }
}
