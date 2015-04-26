<?php

class Entity
{
	protected $position;

	protected $entityValue;

	protected $entityType;
	
	public function __construct($position, $entityValue, $entityType) 
	{
		$this->position = $position;
		$this->entityValue = $entityValue;
		$this->entityType = $entityType;
	}

	public function getPosition() 
	{
		return $this->position;
    	}

	public function getEntityValue() 
	{
		return $this->entityValue;
	}

        public function getEntityType()
        {
                return $this->entityType;
        }

	public function toJson()
	{
		$object = array();
		$object["position"] = $this->position;
		$object["entity_value"] = $this->entityValue;
		$object["entity_type"] = $this->entityType

		return json_encode($object);
	}
}
