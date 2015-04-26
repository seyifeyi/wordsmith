<?php

require_once "../CoreDomain/Text/Text.php";
require_once "../Infrastructure/TextRepository.php";

class TextController
{
	private $textRepository;

	public function __construct() 
	{
		$this->textRepository = new TextRepository();
	}

	public function findTextById($request)
	{
		$textId = $request["textId"];
		$text = $this->textRepository->findTextById($textId);

		return $text->toJson();
	}

        public function findTextByEntityCount($request)
        {
                $textName = $request["entityCount"];
                $text = $this->textRepository->findTextByEntityCount($entityCount);

                return $text->toJson();
        }

}
