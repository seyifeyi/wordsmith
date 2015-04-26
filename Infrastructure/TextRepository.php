<?php

require_once "DB.php";
require_once "../CoreDomain/Text/Text.php";

class TextRepository extends DB
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

	public function findTextById($textId)
	{
		try {
			$query = "SELECT * FROM micropost WHERE id=:textId";
			$sql = $this->db->prepare($query);
			$sql->bindParam(":textId", $textId, PDO::PARAM_INT);

			if(!$sql->execute()) {
				return false;
			}
			$objects = $sql->fetchAll(PDO::FETCH_OBJ);
			$texts = $this->buildObject($objects);
			return $texts;
		}
		catch(PDOException $e) {
			echo "Unable to find " . $e->getMessage();
			return false;
		}
	}

        public function findTextByEntityCount($entityCount)
        {
                try {
                        $query = "SELECT * FROM micropost WHERE entity_count=:entityCount";
                        $sql = $this->db->prepare($query);
                        $sql->bindParam(":entityCount", $entityCount, PDO::PARAM_INT);

                        if(!$sql->execute()) {
                                return false;
                        }
                        $objects = $sql->fetchAll(PDO::FETCH_OBJ);
                        $texts = $this->buildObject($objects);
                        return $texts;
                }
                catch(PDOException $e) {
                        echo "Unable to find " . $e->getMessage();
                        return false;
                }
        }

	public function getTextSet($start = 0, $limit = 1000)
	{
		try {
			$query = "SELECT id, entity_count, text_string FROM micropost WHERE id >= :start LIMIT :limit";
                        $sql = $this->db->prepare($query);
                        $sql->bindParam(":start", intval($start), PDO::PARAM_INT);
                        $sql->bindParam(":limit", intval($limit), PDO::PARAM_INT);

                        if(!$sql->execute()) {
                                return false;
                        }
                        $objects = $sql->fetchAll(PDO::FETCH_OBJ);
                        $texts = $this->buildObject($objects);
                        return $texts;
		}
		catch(PDOException $e) {
                        echo "Unable to find " . $e->getMessage();
                        return false;
		}
	}

	private function buildObject($objects)
	{
		$texts = array();

                foreach($objects as $object) {
			$id = $object->id;
			$textString = str_ireplace(array("rt ", "_mention_", "_hashtag_", "_url_", ": ", "\\", "-", "...", ",", ";", "?", "\"", "``", "''"), array("", "", "", "", " ", " ", " - ", " ... ", " ,", " ;", " ? ", "", "", ""), $object->text_string);
			$pattern1 = '/([a-z])([A-Z])/';
			$pattern2 = '/([a-z])(\.)/';
			$pattern3 = '/(\))([a-z]|[A-Z])/';
			$replace = '${1} ${2}';
			$textString = preg_replace(array($pattern2, $pattern3), array($replace, $replace), $textString);			
			//$entities = json_decode($object->entities);
			$entities = "";
			$entityCount = $object->entity_count;

			$text = new Text($id, $textString, $entities, $entityCount);
			array_push($texts, $text);
		}

		return $texts;
	}
}
