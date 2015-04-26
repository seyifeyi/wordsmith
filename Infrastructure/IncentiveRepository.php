<?php

require_once "DB.php";
require_once "../CoreDomain/Incentive/Incentive.php";

class IncentiveRepository extends DB
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

        public function startIncentive(Incentive $incentive)
        {   
                try {
                        $query = "INSERT INTO incentives (workers_id, workers_inc, incentive, target, creation_date) 
					VALUES (:workers_id, :workers_inc, :incentive_type, :target, :creation_date)";
                        $sql = $this->db->prepare($query);
			$this->bindParameters($sql, $incentive);

                        if (!$sql->execute()) {
                                return false;
                        }
			$this->startIncentiveTraining($incentive);
                        return $incentive;
                }   
                catch (PDOException $e) {
                        echo "Unable to add incentive " . $e->getMessage();
                        return false;
                }   
        }  
 
	private function startIncentiveTraining(Incentive $incentive)
	{
		try {
			$query = "INSERT INTO incentives_training
				    (workers_id, workers_inc, current_workers_inc, incentive, target, creation_date)
				  VALUES
				    (:workers_id, :workers_inc, :current_workers_inc, :incentive_type, :target, :creation_date)";
			
			$sql = $this->db->prepare($query);
			$sql->bindParam(":current_workers_inc", $incentive->getCurrentWorkersInc(), PDO::PARAM_STR);
			$this->bindParameters($sql, $incentive);
			
			if (!$sql->execute()) {
                                return false;
                        }
                        return $incentive;	
		}
                catch (PDOException $e) {
                        echo "Unable to start incentive training " . $e->getMessage();
                        return false;
                }
	}

	public function updateIncentiveTraining(Incentive $incentive)
	{
		try {
			$query = "UPDATE incentives_training SET current_workers_inc = :current_workers_inc 
                                        WHERE workers_id = :workers_id AND workers_inc = :workers_inc
                                        AND incentive = :incentive_type AND target = :target
					ORDER BY id DESC LIMIT 1";
                        $sql = $this->db->prepare($query);
                        $sql->bindParam(":current_workers_inc", $incentive->getCurrentWorkersInc(), PDO::PARAM_STR);
                        $this->bindParameters($sql, $incentive);                        
			$sql->execute();
		}
                catch (PDOException $e) {
                        echo "Unable to update incentive training " . $e->getMessage();
                        return false;
                }
	}

	public function redeemIncentive(Incentive $incentive)
	{
		try {
			$query = "UPDATE incentives SET redemption_date = :redemption_date 
					WHERE workers_id = :workers_id AND workers_inc = :workers_inc 
					AND incentive = :incentive_type AND target = :target";
			$sql = $this->db->prepare($query);
                        $this->bindParameters($sql, $incentive);

			if (!$sql->execute()) {
				return false;
			}
			return $incentive;
		}
                catch (PDOException $e) {
                        echo "Unable to add " . $e->getMessage();
                        return false;
                }
	}

        public function getProbabilities($incentive, $lowerBound, $upperBound)
        {
                // IF(lead4.workers_inc > incen4.workers_inc, concat("yay", incen4.incentive), concat("nay", incen4.incentive)) AS increased
                try {
                        $query = "SELECT
                            incen4.workers_id,
                            incen4.workers_inc AS start_workers_inc,
                            lead4.workers_inc AS end_workers_inc,
                            incen4.incentive,
                            incen4.redemption_date
                        FROM incentives_training AS incen4
                        LEFT JOIN leaderboard_ex4 AS lead4 ON incen4.workers_id = lead4.workers_id
                        WHERE incentive = :incentive AND incen4.workers_inc > :lowerBound AND incen4.workers_inc < :upperBound
                        ORDER BY incen4.workers_inc ASC";

                        $sql = $this->db->prepare($query);
                        $sql->bindParam(":incentive", $incentive, PDO::PARAM_STR);
                        $sql->bindParam(":lowerBound", $lowerBound, PDO::PARAM_INT);
                        $sql->bindParam(":upperBound", $upperBound, PDO::PARAM_INT);

                        if (!$sql->execute()) {
                                return false;
                        }
                        $objects = $sql->fetchAll(PDO::FETCH_OBJ);
                        $count = 0;
                        $basePriors = $this->populateBasePriors($upperBound);

                        foreach ($objects as $object) {
                                $exitAttemptPoint = $object->start_workers_inc;
                                $exitAttemptPriors = $basePriors[$exitAttemptPoint."_"];

                                if ($object->end_workers_inc > $object->start_workers_inc) {
                                        $exitAttemptPriors["total"] += 1;
                                        $exitAttemptPriors["positive"] += 1;
                                } else {
                                        $exitAttemptPriors["total"] += 1;
                                }

                                $basePriors[$exitAttemptPoint."_"] = $exitAttemptPriors;
                        }
                        return $basePriors;
                }
                catch (PDOException $e) {
                        echo "Unable to find " . $e->getMessage();
                        return false;
                }
        }

        public function populateBasePriors($upperBound)
        {       
                $default = array();
                $default["positive"] = 1;
                $default["total"] = 2;
                $priors  = array();
                for ($i = 0; $i < $upperBound; $i++) {
                        $priors[$i."_"] = $default;
                }

                return $priors;
        }

	private function bindParameters($sql, $incentive)
	{
		$sql->bindParam(":workers_id", $incentive->getWorkersId(), PDO::PARAM_STR);
		$sql->bindParam(":workers_inc", $incentive->getWorkersInc(), PDO::PARAM_STR);
		$sql->bindParam(":incentive_type", $incentive->getIncentiveType(), PDO::PARAM_STR);
		$sql->bindParam(":target", $incentive->getTarget(), PDO::PARAM_STR);
		if (NULL != $incentive->getCreationDate()) {
			$sql->bindParam(":creation_date", $incentive->getCreationDate(), PDO::PARAM_STR);
                }
		if (NULL != $incentive->getRedemptionDate()) {
			$sql->bindParam(":redemption_date", $incentive->getRedemptionDate(), PDO::PARAM_STR);
		}
		return $sql;
	}

	private function buildObject($object)
	{
		$workersId = $object->workers_id;
		$workersInc = $object->workers_inc;
		$incentiveType = $object->incentive_type;
		$target = $object->target;
		$creationDate = $object->creation_date;
		$redemptionDate = $object->redemption_date;

		$incentive = new Incentive($workersId, $workersInc, $target, $incentiveType);
		$incentive->setCreationDate($creationDate);
		$incentive->setRedemptionDate($redemptionDate);

		return $incentive;
	}

}
