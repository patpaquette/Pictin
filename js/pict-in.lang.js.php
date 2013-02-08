<?php
session_start();

if(file_exists('../lang/'.$_SESSION["lang"].'.php')){
	require '../lang/'.$_SESSION["lang"].'.php';
	//echo('../lang/'.PICTIN_LANG.'.php');
}


?>
PICTIN.localized={
<?php
if(isset($localized) && is_array($localized)){
	foreach($localized as $original=>$translated){
		$original=str_replace("'", "\\'", $original);
		$translated=str_replace("'", "\\'", $translated);
		
		if($original && $translated)
			echo "\t'$original':'$translated',\r\n";
	}
}
?>
}