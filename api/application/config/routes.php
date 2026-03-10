<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
| -------------------------------------------------------------------------
| URI ROUTING
| -------------------------------------------------------------------------
| This file lets you re-map URI requests to specific controller functions.
| See: https://codeigniter.com/userguide3/general/routing.html
|
| RESERVED ROUTES:
|   $route['default_controller'] = 'welcome';
|   $route['404_override'] = '';
|   $route['translate_uri_dashes'] = FALSE;
|
*/

$route['default_controller'] = 'Welcome';
$route['404_override'] = '';
$route['translate_uri_dashes'] = FALSE;

$route['swagger'] = 'SwaggerController/index';
$route['project-api-documentation'] = 'SwaggerController/index';
$route['swagger/json'] = 'SwaggerController/json';
$route['swagger/json/(:any)'] = 'SwaggerController/json/$1';
