<?php

//header('Access-Control-Allow-Origin: *');  

//$file ="http://balsoni.free.fr/ndack.xml";
//readfile($file);
 
if(isset($_REQUEST['file']))
{
    $file = $_REQUEST['file'];
    echo file_get_contents($file);
}
else
{
    echo "Parameter file is missing !";
}
?>