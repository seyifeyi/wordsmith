<?php

class DB
{
	const USERNAME = "turk";
	const PASSWORD = "vune59wopo";
	CONST DSN = "mysql:host=mysql3.ecs.soton.ac.uk;dbname=turk";

	private static $_instance;

	public function &pdo_connection()
	{
		if(!self::$_instance) {
			try {
				self::$_instance = new PDO(self::DSN, self::USERNAME, self::PASSWORD);
				self::$_instance->setAttribute(PDO::ATTR_PERSISTENT, true);
				self::$_instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			}
			catch(PDOException $e) {
				die("Connection error" . $e->getMessage());
			}
		}
		return self::$_instance;
	}

	private function __construct() {}

	private function __clone() {}
}
