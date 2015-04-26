<?php

require_once "../CoreDomain/Incentive/Incentive.php";
require_once "../Infrastructure/IncentiveRepository.php";

class IncentiveController
{
	private $incentiveRepository;

	public function __construct() 
	{
		$this->incentiveRepository = new IncentiveRepository();
	}

	public function startIncentive($request)
	{
                $workersId = $request["workersId"];
		$workersInc = $request["workersInc"];
		$target = $request["target"];
		$incentiveType = $request["incentive"];

		$incentive = new Incentive($workersId, $workersInc, $target, $incentiveType);
		$incentive->setCreationDate(date("Y-m-d H:i:s", time()));
                $incentive->setRedemptionDate(NULL);
		$incentive = $this->incentiveRepository->startIncentive($incentive);

		return $incentive->toJson();
	}

	public function updateIncentive($request)
	{
                $workersId = $request["workersId"];
                $workersInc = $request["workersInc"];
                $currentWorkersInc = $request["currentWorkersInc"];
                $target = $request["target"];
                $incentiveType = $request["incentive"];

                $incentive = new Incentive($workersId, $workersInc, $target, $incentiveType);
		$incentive->setCurrentWorkersInc($currentWorkersInc);
                $incentive->setCreationDate(NULL);
                $incentive->setRedemptionDate(NULL);

		$incentive = $this->incentiveRepository->updateIncentiveTraining($incentive);
	}

	public function redeemIncentive($request)
	{
		$workersId = $request["workersId"];
                $workersInc = $request["workersInc"];
                $target = $request["target"];
                $incentiveType = $request["incentive"];

                $incentive = new Incentive($workersId, $workersInc, $target, $incentiveType);
		$incentive->setRedemptionDate(date("Y-m-d H:i:s", time()));
                $incentive->setCreationDate(NULL);
                $incentive = $this->incentiveRepository->redeemIncentive($incentive);

                return $incentive->toJson();
	}

        public function getProbabilities($request)
        {
                $incentive = $request["incentive"];
                $lowerBound = $request["lowerBound"];
                $upperBound = $request["upperBound"];

                $probabilities = $this->incentiveRepository->getProbabilities($incentive, $lowerBound, $upperBound);

                return json_encode($probabilities);
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
