<?php

require_once "Text.php";

class UserText extends Text
{
	protected $id;

	protected $workersId;

	protected $textId;

	protected $timestamp;

        protected $timeTaken;

	protected $dataPoints;

	public function __construct($workersId, $textId, $textString, $entities, $entityCount) 
	{
		$this->workersId = $workersId;
		$this->entities = $entities;
		$this->textId = $textId;
		$this->textString = $textString;
		$this->entityCount = $entityCount;
	}

        public function getId()
        {
                return $this->id;
        }

	public function getTextId()
	{
		return $this->textId;
	}

	public function getWorkersId() 
	{
		return $this->workersId;
	}

	public function getTimestamp() 
	{
		return $this->timestamp;
	}

        public function getTimeTaken()
        {
                return $this->timeTaken;
        }

	public function setTimeTaken($timeTaken)
	{
		$this->timeTaken = $timeTaken;
	}

        public function getDataPoints()
        {
                return $this->dataPoints;
        }

        public function setDataPoints($dataPoints)
        {
                $this->dataPoints = $dataPoints;
        }
}
