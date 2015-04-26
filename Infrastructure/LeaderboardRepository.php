<?php

require_once "DB.php";
require_once "../CoreDomain/Leaderboard/Leaderboard.php";

class LeaderboardRepository extends DB
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

	public function getLeaderboardRecordById($workersId)
	{
		$leaderboard = null;
                try{
                        $query = "SELECT * FROM leaderboard WHERE workers_id=:workers_id";
                        $sql = $this->db->prepare($query);
                        $sql->bindParam(":workers_id", $workersId, PDO::PARAM_STR);

                        if(!$sql->execute()) {
                                return false;
                        }
                        $object = $sql->fetch(PDO::FETCH_OBJ); 
			if($object == false) {
				return $leaderboard;
			}

                        $leaderboard = $this->buildObject($object);
			$leaderboard->setWorkersPosition($this->getLeaderboardPosition($workersId));

                        return $leaderboard;
                }
                catch(PDOException $e) {
                        echo "Unable to get " . $e->getMessage();
                        return $leaderboard;
                }
	}
	
	public function getLeaderboardPosition($workersId) {
                try{
                        $query = "SELECT count(*) AS position FROM leaderboard WHERE workers_points > 
					(SELECT workers_points FROM leaderboard WHERE workers_id = :workers_id)";
                        $sql = $this->db->prepare($query);
                        $sql->bindParam(":workers_id", $workersId, PDO::PARAM_STR);

                        if(!$sql->execute()) {
                                return false;
                        }
                        $object = $sql->fetch(PDO::FETCH_OBJ);

                        return $object->position + 1;
                }
                catch(PDOException $e) {
                        echo "Unable to get " . $e->getMessage();
                        return 0;
                }
	}

        public function newLeaderboardRecord(Leaderboard $leaderboard)
        {   
                try{
                        $query = "INSERT INTO leaderboard (workers_id, workers_name, workers_pass, workers_code, workers_inc, workers_points, workers_last_image_id) 
					VALUES (:workers_id, :workers_name, :workers_pass, :workers_code, :workers_inc, :workers_points, :workers_last_image_id)";
                        $sql = $this->db->prepare($query);
			$this->bindParameters($sql, $leaderboard);

                        if(!$sql->execute()) {
                                return false;
                        }   
                        return $leaderboard;
                }   
                catch(PDOException $e) {
                        echo "Unable to add " . $e->getMessage();
                        return false;
                }   
        }   

        public function updateLeaderboardRecord(Leaderboard $leaderboard)
        {   
                try{
                        $query = "UPDATE leaderboard SET workers_name=:workers_name, workers_pass=:workers_pass, 
					workers_code=:workers_code, workers_inc=:workers_inc, workers_points=:workers_points,
					workers_last_image_id=:workers_last_image_id
					WHERE workers_id=:workers_id";
                        $sql = $this->db->prepare($query);
                        $this->bindParameters($sql, $leaderboard);

                        if(!$sql->execute()) {
                                return false;
                        }
                        return $leaderboard;
                }
                catch(PDOException $e) {
                        echo "Unable to update " . $e->getMessage();
                        return false;
                }
        }

	public function getTopLeaderboardRecords($limit = 5, $cutoff = 1)
	{
		$leaderboards = array();
                try{
                        $query = "SELECT * FROM leaderboard WHERE last_updated > NOW() - INTERVAL :cutoff HOUR ORDER BY workers_points DESC LIMIT :limit";
                        $sql = $this->db->prepare($query);
                        $sql->bindParam(":limit", intval($limit), PDO::PARAM_INT);
			$sql->bindParam(":cutoff", intval($cutoff), PDO::PARAM_INT);

                        if(!$sql->execute()) {
                                return false;
                        }
                        $objects = $sql->fetchAll(PDO::FETCH_OBJ);
			if (count($objects) < $limit && $cutoff < 10000) {
				$cutoff = $cutoff * 10;
				return $this->getTopLeaderboardRecords($limit, $cutoff);
			}			
			foreach($objects as $object) {
				$leaderboards[] = $this->buildObject($object);
			}
			return $leaderboards;
                }
                catch(PDOException $e) {
                        echo "Unable to get " . $e->getMessage();
                        return $leaderboards;
                }
	}

	private function bindParameters($sql, $leaderboard)
	{
		$sql->bindParam(":workers_id", $leaderboard->getWorkersId(), PDO::PARAM_STR);
		$sql->bindParam(":workers_name", $leaderboard->getWorkersName(), PDO::PARAM_STR);
		$sql->bindParam(":workers_pass", $leaderboard->getWorkersPass(), PDO::PARAM_STR);
		$sql->bindParam(":workers_code", $leaderboard->getWorkersCode(), PDO::PARAM_STR);
		$sql->bindParam(":workers_inc", $leaderboard->getWorkersInc(), PDO::PARAM_INT);
		$sql->bindParam(":workers_points", $leaderboard->getWorkersPoints(), PDO::PARAM_INT);
		$sql->bindParam(":workers_last_image_id", $leaderboard->getWorkersLastImageId(), PDO::PARAM_INT);
		
		return $sql;
	}

	private function buildObject($object)
	{
		$workersId = $object->workers_id;
		$workersName = $object->workers_name;
		$workersPass = $object->workers_pass;
		$workersCode = $object->workers_code;
		$workersInc = $object->workers_inc;
		$workersPoints = $object->workers_points;
		$workersLastImageId = $object->workers_last_image_id;

		$leaderboard = new Leaderboard($workersId, $workersName, $workersPass, $workersCode);
		$leaderboard->incrementWorkersPoints($workersPoints);
		$leaderboard->incrementWorkersInc($workersInc);
		$leaderboard->setWorkersLastImageId($workersLastImageId);

		return $leaderboard;
	}

}
