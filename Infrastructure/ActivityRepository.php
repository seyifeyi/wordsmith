<?php

require_once "DB.php";
require_once "../CoreDomain/Activity/Activity.php";

class ActivityRepository extends DB
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

        public function addActivity(Activity $activity)
        {   
                try{
                        $query = "INSERT INTO activities (workers_id, action_done, action_object, icon, timestamp) 
					VALUES (:workers_id, :action_done, :action_object, :icon, :timestamp)";
                        $sql = $this->db->prepare($query);
			$this->bindParameters($sql, $activity);

                        if(!$sql->execute()) {
                                return false;
                        }   
                        return $activity;
                }   
                catch(PDOException $e) {
                        echo "Unable to add " . $e->getMessage();
                        return false;
                }   
        }   

	public function getActivities($limit = 5)
	{
		$activities = array();
                try{
                        $query = "SELECT * FROM activities ORDER BY id DESC LIMIT :limit";
                        $sql = $this->db->prepare($query);
                        $sql->bindParam(":limit", intval($limit), PDO::PARAM_INT);

                        if(!$sql->execute()) {
                                return false;
                        }
                        $objects = $sql->fetchAll(PDO::FETCH_OBJ);
			
			foreach($objects as $object) {
				$activities[] = $this->buildObject($object);
			}
			return $activities;
                }
                catch(PDOException $e) {
                        echo "Unable to get " . $e->getMessage();
                        return $activities;
                }
	}

	private function bindParameters($sql, $activity)
	{
		$sql->bindParam(":workers_id", $activity->getWorkersId(), PDO::PARAM_STR);
		$sql->bindParam(":action_done", $activity->getActionDone(), PDO::PARAM_STR);
		$sql->bindParam(":action_object", $activity->getActionObject(), PDO::PARAM_STR);
		$sql->bindParam(":icon", $activity->getIcon(), PDO::PARAM_STR);
		$sql->bindParam(":timestamp", $activity->getTimestamp(), PDO::PARAM_STR);
		//$sql->bindParam(":datetime", $activity->getDatetime(), PDO::PARAM_INT);
		
		return $sql;
	}

	private function buildObject($object)
	{
		$workersId = $object->workers_id;
		$actionDone = $object->action_done;
		$actionObject = $object->action_object;
		$icon = $object->icon;
		$timestamp = $object->timestamp;
		$datetime = $object->datetime;

		$activity = new Activity($workersId, $actionDone, $actionObject, $icon);
		$activity->setTimestamp($timestamp);
		$activity->setDatetime($datetime);

		return $activity;
	}

}
