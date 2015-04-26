<?php

require_once "../CoreDomain/Text/UserText.php";
require_once "../Infrastructure/UserTextRepository.php";

class UserTextController
{
	private $userTextRepository;

	public function __construct() 
	{
		$this->userTextRepository = new UserTextRepository();
	}

	public function addUserText($request)
	{
		$workersId = $request["workersId"];
		$textId = $request["id"];
		$textString = $request["textString"];
		$entities = json_encode($request["entities"]);
		$entityCount = $request["entityCount"];
		$timeTaken = $request["timeTaken"];
                $dataPoints = json_encode($request["dataPoints"]);
		
		if (trim($entities) == "") {
			return 0;
		}
		$userText = new UserText($workersId, $textId, $textString, $entities, $entityCount);
		$userText->setTimeTaken($timeTaken);
                $userText->setDataPoints($dataPoints);
		$id = $this->userTextRepository->addUserText($userText);

		return $id;
	}

	public function getTextWorkersScores($request)
	{
                $workersId = $request["workersId"];
		$scores = $this->userTextRepository->getTextWorkersScores($workersId);

		return json_encode($scores);
	}

	public function findRecentWorkerTexts($request)
	{
		$workersId = $request["workersId"];
		$limit = $request["limit"];

		$texts = $this->userTextRepository->findRecentWorkerTexts($workersId, $limit);
                $recent = array();
                foreach($texts as $text) {
                        $recent[] = $text->toJson();
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
