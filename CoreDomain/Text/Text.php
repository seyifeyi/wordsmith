<?php

class Text
{
	protected $id;

	protected $textString;

	protected $entities;

	protected $entityCount;
	
	public function __construct($id, $textString, $entities, $entityCount) 
	{
		$this->id = $id;
		$this->textString = $textString;
		$this->entities = $entities;
		$this->entityCount = $entityCount;
	}

	public function getId()
	{
		return $this->id;
	}

	public function getTextString() 
	{
		return $this->textString;
    	}

	public function getEntities() 
	{
		return $this->entities;
	}

	public function getEntityCount()
	{
		return $this->entityCount;
	}

	public function toJson()
	{
		$object = array();
		$object["id"] = $this->id;
		$object["text_string"] = $this->textString;
		$object["entities"] = $this->entities;
		$object["entity_count"] = $this->entityCount;

		return json_encode($object);
	}
}
