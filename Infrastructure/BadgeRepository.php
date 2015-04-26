<?php

require_once "DB.php";
require_once "../CoreDomain/Badge/Badge.php";

class BadgeRepository extends DB
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

	public function getBadgeByInc($workersInc)
	{
                try{
                        $query = "SELECT * FROM badge_alloc WHERE workers_inc=:workers_inc";
                        $sql = $this->db->prepare($query);
                        $sql->bindParam(":workers_inc", $workersId, PDO::PARAM_INT);

                        if(!$sql->execute()) {
                                return false;
                        }
                        $object = $sql->fetch(PDO::FETCH_OBJ);
                        $badge = $this->buildObject($object);

                        return $badge;
                }
                catch(PDOException $e) {
                        echo "Unable to get " . $e->getMessage();
                        return $badge;
                }
	}


	public function getBadges()
	{
		$badges = array();
                try{
                        $query = "SELECT * FROM badge_alloc ORDER BY worker_inc ASC";
                        $sql = $this->db->prepare($query);

                        if(!$sql->execute()) {
                                return false;
                        }
                        $objects = $sql->fetchAll(PDO::FETCH_OBJ);
                        foreach($objects as $object) {
                                $badges[] = $this->buildObject($object);
                        }

                        return $badges;
                }
                catch(PDOException $e) {
                        echo "Unable to get " . $e->getMessage();
                        return $badges;
                }
	}

	private function buildObject($object)
	{
		$badgeUrl = $object->badge_id;
		$workersInc = $object->worker_inc;
		$badgeName = $object->badge_name;

		$badge = new Badge($badgeUrl, $workersInc, $badgeName);

		return $badge;
	}

}
