<?php

require_once "../CoreDomain/Image/Image.php";
require_once "../Infrastructure/ImageRepository.php";

class ImageController
{
	private $imageRepository;

	public function __construct() 
	{
		$this->imageRepository = new ImageRepository();
	}

	public function findImageById($request)
	{
		$imageId = $request["imageId"];
		$image = $this->imageRepository->findImageById($imageId);

		return $image->toJson();
	}

        public function findImageByName($request)
        {
                $imageName = $request["imageName"];
                $image = $this->imageRepository->findImageByName($imageName);

                return $image->toJson();
        }

}
