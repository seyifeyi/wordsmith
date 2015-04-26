<?php

require_once "DB.php";
require_once "../CoreDomain/Text/UserText.php";

class UserTextRepository extends DB
{

        private $db = ""; 

        public function __construct()
        {   
                $this->db = $this->pdo_connection();        
        }   

        public function __destruct()
        {   
                $this->db = null;                   
        }   

        public function addUserText(UserText $userText)
        {
                try {
                        $query = "INSERT INTO user_micropost (workers_id, text_id, text_string, entities, entity_count, time_taken, data_points) 
					VALUES (:workers_id, :text_id, :text_string, :entities, :entity_count, :time_taken, :data_points)";
                        $sql = $this->db->prepare($query);

                        $sql->bindParam(":workers_id", $userText->getWorkersId(), PDO::PARAM_STR);
			$sql->bindParam(":text_id", $userText->getTextId(), PDO::PARAM_STR);
			$sql->bindParam(":text_string", $userText->getTextString(), PDO::PARAM_STR);
			$sql->bindParam(":entities", $userText->getEntities(), PDO::PARAM_STR);
			$sql->bindParam(":entity_count", $userText->getEntityCount(), PDO::PARAM_STR);
                        $sql->bindParam(":time_taken", $userText->getTimeTaken(), PDO::PARAM_STR);
                        $sql->bindParam(":data_points", $userText->getDataPoints(), PDO::PARAM_STR);

                        if(!$sql->execute()) {
                                return false;
                        }
                        return true;
                }   
                catch(PDOException $e) {
                        echo "Unable to add " . $e->getMessage();
                        return false;
                }   
        }   

        public function getDataPoints()
	{
		try {
			$dataset = "ritter";
			$range = $this->getDatasetRange($dataset);
			$startRange = $range[0];
			$endRange = $range[1];

                        $query = "SELECT data_points FROM user_micropost WHERE text_id >= :startRange AND text_id <= :endRange AND data_points != '' GROUP BY workers_id LIMIT 75";
			if ($dataset == "msm") {
	                        $query = "SELECT data_points FROM user_micropost_1 WHERE text_id >= :startRange AND text_id <= :endRange AND data_points != '' GROUP BY workers_id LIMIT 75";
			}
                        $sql = $this->db->prepare($query);
                        $sql->bindParam(":startRange", $startRange, PDO::PARAM_INT);
                        $sql->bindParam(":endRange", $endRange, PDO::PARAM_INT);

                        if(!$sql->execute()) {
                                return false;
                        }

                        $objects = $sql->fetchAll(PDO::FETCH_OBJ);

			$dataPoints = array();
                        foreach($objects as $object) {
				$dataPoints = array_merge($dataPoints, json_decode($object->data_points));
                        }

                        return $dataPoints;
		}
		catch (PDOException $e) {
                        echo "Unable to add " . $e->getMessage();
                        return false;
		}
	}

        private function getDatasetRange($dataset)
        {
                if ($dataset == "ritter") {
                        return array(1, 2394);
                }
                if ($dataset == "finin") {
                        return array(2395, 2835);
                }
                if ($dataset == "msm") {
                        return array(1, 1450);
                }
                if ($dataset == "ramine") {
                        return array(4286, 7665);
                }
        }

        public function getTextWorkersScores($workersId)
	{
		try {
                        $query = "SELECT sum(1) as tagged_texts, sum(entity_count) as entities_found FROM user_micropost WHERE workers_id = :workers_id";
                        $sql = $this->db->prepare($query);
                        $sql->bindParam(":workers_id", $workersId, PDO::PARAM_STR);

                        if(!$sql->execute()) {
                                return false;
                        }

                        $result = $sql->fetch(PDO::FETCH_OBJ);
			if ($result->tagged_texts == null) {
				$result->tagged_texts = 0;
				$result->entities_found = 0;
			}
                        return $result;
		}
                catch (PDOException $e) {
                        echo "Unable to add " . $e->getMessage();
                        return false;
                }
	}

        public function findRecentWorkerTexts($workersId, $limit)
        {
		$texts = array();

		try {
			$query = "SELECT * FROM user_micropost WHERE workers_id = :workers_id ORDER BY timestamp DESC LIMIT :limit";
			$sql = $this->db->prepare($query);
			$sql->bindParam(":workers_id", $workersId, PDO::PARAM_STR);
			$sql->bindParam(":limit", intval($limit), PDO::PARAM_INT);

                        if(!$sql->execute()) {
                                return false;
                        }

                        $objects = $sql->fetchAll(PDO::FETCH_OBJ);

                        foreach($objects as $object) {
                                $texts[] = $this->buildObject($object);
                        }
                        return $texts;
		}
		catch(PDOException $e) {
                        echo "Unable to find " . $e->getMessage();
                        return false;
		}
        }   

	private function buildObject($object)
        {
                $workersId = $object->workers_id;
                $textString = $object->text_string;
		$entities = $object->entities;
		$entityCount = $object->entityCount;
		
		$userText = new UserText($workersId, $textString, $entities, $entityCount);

                return $userText;
        }
}
