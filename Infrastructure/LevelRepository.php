<?php

require_once "DB.php";
require_once "../CoreDomain/Badge/Level.php";

class LevelRepository extends DB
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

	public function getLevels()
	{
		$levels = array();
                try{
                        $query = "SELECT * FROM levels ORDER by level_min ASC";
                        $sql = $this->db->prepare($query);

                        if(!$sql->execute()) {
                                return false;
                        }
                        $objects = $sql->fetchAll(PDO::FETCH_OBJ);
                        foreach($objects as $object) {
                                $levels[] = $this->buildObject($object);
                        }

                        return $levels;
                }
                catch(PDOException $e) {
                        echo "Unable to get " . $e->getMessage();
                        return $levels;
                }
	}

	private function buildObject($object)
	{
		$levelMin = $object->level_min;
		$levelMax = $object->level_max;
		$levelRank = $object->level_rank;

		$level = new Level($levelMin, $levelMax, $levelRank);

		return $level;
	}

}
