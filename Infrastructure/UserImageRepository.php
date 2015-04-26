<?php

require_once "DB.php";
require_once "../CoreDomain/Image/UserImage.php";

class UserImageRepository extends DB
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

        public function addUserImage(UserImage $userImage)
        {   
                try{
                        $query = "INSERT INTO tags (workers_id, img_name, tag1, tag2, tag3, tag4, tag5) 
					VALUES (:workers_id, :img_name, :tag1, :tag2, :tag3, :tag4, :tag5)";
                        $sql = $this->db->prepare($query);
			$userImageTags = $userImage->getTags();
			$tag1 = $userImageTags[0];
			$tag2 = (count($userImageTags) > 1) ? $userImageTags[1] : "";
			$tag3 = (count($userImageTags) > 2) ? $userImageTags[2] : "";
                        $tag4 = (count($userImageTags) > 3) ? $userImageTags[3] : "";
                        $tag5 = (count($userImageTags) > 4) ? $userImageTags[4] : "";

                        $sql->bindParam(":workers_id", $userImage->getWorkersId(), PDO::PARAM_STR);
			$sql->bindParam(":img_name", $userImage->getImageName(), PDO::PARAM_STR);
			$sql->bindParam(":tag1", $tag1, PDO::PARAM_STR);
			$sql->bindParam(":tag2", $tag2, PDO::PARAM_STR);
			$sql->bindParam(":tag3", $tag3, PDO::PARAM_STR);
                        $sql->bindParam(":tag4", $tag4, PDO::PARAM_STR);
                        $sql->bindParam(":tag5", $tag5, PDO::PARAM_STR);

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

        public function findRecentWorkerImages($workersId, $limit)
        {
		$images = array();

		try {
			$query = "SELECT * FROM tags WHERE workers_id = :workers_id ORDER BY timestamp DESC LIMIT :limit";
			$sql = $this->db->prepare($query);
			$sql->bindParam(":workers_id", $workersId, PDO::PARAM_STR);
			$sql->bindParam(":limit", intval($limit), PDO::PARAM_INT);

                        if(!$sql->execute()) {
                                return false;
                        }

                        $objects = $sql->fetchAll(PDO::FETCH_OBJ);

                        foreach($objects as $object) {
                                $images[] = $this->buildObject($object);
                        }
                        return $images;
		}
		catch(PDOException $e) {
                        echo "Unable to find " . $e->getMessage();
                        return false;
		}
        }   

	private function buildObject($object)
        {
                $workersId = $object->workers_id;
                $imageName = $object->img_name;
		$tag1 = $object->tag1;
		$tag2 = $object->tag2;
		$tag3 = $object->tag3;
		$tag4 = $object->tag4;
		$tag5 = $object->tag5;
		$tags = array($tag1, $tag2, $tag3, $tag4, $tag5);
		
		$userImage = new UserImage($workersId, $imageName, $tags);

                return $userImage;
        }
}
