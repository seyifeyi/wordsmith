<?php

class Image
{
	protected $id;

	protected $imageName;

	protected $tags;
	
	public function __construct($imageName, $tags) 
	{
		$this->imageName = $imageName;
		$this->tags = $tags;
	}

	public function getImageName() 
	{
		return $this->imageName;
    	}

	public function getTags() 
	{
		return $this->tags;
	}

	public function getRandomTags($limit = 15) 
	{
		$tags = $this->tags;
		shuffle($tags);

		return array_slice($tags, 0, $limit);
	}

	public function toJson()
	{
		$object = array();
		$object["image_name"] = $this->imageName;
		$object["tags"] = $this->getRandomTags();

		return json_encode($object);
	}
}
