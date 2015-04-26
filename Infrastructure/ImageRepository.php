<?php

require_once "DB.php";
require_once "../CoreDomain/Image/Image.php";

class ImageRepository extends DB
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

	public function findImageById($imageId)
	{
		try{
			$query = "SELECT * FROM images WHERE img_name = (SELECT img_name FROM images WHERE id=:imageId)";
			$sql = $this->db->prepare($query);
			$sql->bindParam(":imageId", $imageId, PDO::PARAM_INT);

			if(!$sql->execute()) {
				return false;
			}
			$objects = $sql->fetchAll(PDO::FETCH_OBJ);
			$image = $this->buildObject($objects);
			return $image;
		}
		catch(PDOException $e) {
			echo "Unable to find " . $e->getMessage();
			return false;
		}
	}

        public function findImageByName($imageName)
        {
                try{
                        $query = "SELECT * FROM images WHERE img_name=:imageName";
                        $sql = $this->db->prepare($query);
                        $sql->bindParam(":imageName", $imageName, PDO::PARAM_INT);

                        if(!$sql->execute()) {
                                return false;
                        }
                        $objects = $sql->fetchAll(PDO::FETCH_OBJ);
                        $image = $this->buildObject($objects);
                        return $image;
                }
                catch(PDOException $e) {
                        echo "Unable to find " . $e->getMessage();
                        return false;
                }
        }

	public function getImageSet($limit = 1000)
	{
		$images = array();
                try{
                        $query = "SELECT img_name, '' AS tag FROM images
					WHERE status != 'NSFW'
					GROUP BY img_name 
					ORDER BY 
					COUNT(1) DESC,
					img_name DESC
					LIMIT :limit";
                        $sql = $this->db->prepare($query);
                        $sql->bindParam(":limit", intval($limit), PDO::PARAM_INT);

                        if(!$sql->execute()) {
                                return false;
                        }
                        $objects = $sql->fetchAll(PDO::FETCH_OBJ);
			foreach($objects as $object) {
                        	$images[] = $this->buildObject(array($object));
			}
                        return $images;
                }
                catch(PDOException $e) {
                        echo "Unable to find " . $e->getMessage();
                        return false;
                }
	}

	private function buildObject($objects)
	{
                $imageName = $objects[0]->img_name;
                foreach($objects as $object) {
                        $tags[] = $object->tag;
                }

		$image = new Image($imageName, $tags);
		return $image;
	}
}
