<?php

require_once "../CoreDomain/Image/UserImage.php";
require_once "../Infrastructure/UserImageRepository.php";

class UserImageController
{
	private $userImageRepository;

	public function __construct() 
	{
		$this->userImageRepository = new UserImageRepository();
	}

	public function addUserImage($request)
	{
		$workersId = $request["workersId"];
		$imageName = $request["imageName"];
		$tags = $request["tags"];
		
		if (trim($tags[0]) == "" || trim($tags[1]) == "") {
			return 0;
		}
		$userImage = new UserImage($workersId, $imageName, $tags);
		$id = $this->userImageRepository->addUserImage($userImage);

		return $id;
	}

	public function findRecentWorkerImages($request)
	{
		$workersId = $request["workersId"];
		$limit = $request["limit"];

		$images = $this->userImageRepository->findRecentWorkerImages($workersId, $limit);
                $recent = array();
                foreach($images as $image) {
                        $recent[] = $image->toJson();
                }

                return $this->collectionAsJson($recent);
	}

	public function isValidEnglishString($request)
	{
		$isValid = "false";
		$tag = $request["tag"];
		$tag_string = file_get_contents("http://en.wiktionary.org/w/api.php?action=query&titles=" . $tag . "&format=json");
		$tag_json = json_decode($tag_string);
		$pages = $tag_json->query->pages;
		$id = 0;
		foreach($pages as $pageId => $pageObject) {
			$id = $pageId;
		}
		if($id != -1) {
			$isValid = "true";
		}
                $object = array();
                $object["isValid"] = $isValid;

                return json_encode($object);

	}

        public function collectionAsJson($collection)
        {
                $json = "[";
                foreach($collection as $jsonString) {
                        $json = $json . $jsonString . ",";
                }
                $json = substr($json, 0, strlen($json) - 1);
                $json .= "]";

                return $json;
        }
}
