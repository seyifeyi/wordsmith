<?php

class Activity
{
	private $workersId;

	private $actionDone;

	private $actionObject;

	private $icon;

	private $datetime;

	private $timestamp;
	
	public function __construct($workersId, $actionDone, $actionObject, $icon) 
	{
		$this->workersId = $workersId;
		$this->actionDone = $actionDone;
		$this->actionObject = $actionObject;
		$this->icon = $icon;
	}

	public function getWorkersId() 
	{
		return $this->workersId;
    	}

	public function getActionDone()
	{
		return $this->actionDone;
	}

	public function getActionObject()
	{
		return $this->actionObject;
	}

	public function getIcon()
	{
		return $this->icon;
	}

        public function getDatetime()
        {
                return $this->datetime;
        }

        public function getTimestamp()
        {
                return $this->timestamp;
        }

        public function setWorkersId($workersId)
        {
                $this->workersId = $workersId;
        }

	public function setActionDone($actionDone)
	{
		$this->actionDone = $actionDone;
	}

	public function setActionObject($actionObject)
	{
		$this->actionObject = $actionObject;
	}

	public function setIcon($icon)
	{
		$this->icon = $icon;
	}

        public function setDatetime($datetime)
        {
                $this->datetime = $datetime;
        }

        public function setTimestamp($timestamp)
        {
                $this->timestamp = $timestamp;
        }

        public function toJson()
        {
                $object = array();
                $object["workers_id"] = $this->workersId;
                $object["action_done"] = $this->actionDone;
		$object["action_object"] = $this->actionObject;
		$object["icon"] = $this->icon;
		$object["timestamp"] = $this->timestamp;
		$object["datetime"] = $this->datetime;

                return json_encode($object);
        }
}
