<?php
if (isset($_GET["id"])) {
	header( "Location: app/#/register/" . $_GET["id"] );
} else {
	header( "Location: app" );
}
