<?php

require_once "Image.php";

class UserImage extends Image
{
	private $workersId;

	private $timestamp;

	public function __construct($workersId, $imageName, $tags) 
	{
		$this->workersId = $workersId;
		$this->tags = $tags;
		$this->imageName = $imageName;
	}

	public function getWorkersId() 
	{
		return $this->workersId;
	}

	public function getTimestamp() 
	{
		return $this->timestamp;
	}

}
