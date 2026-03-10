<?php
namespace App\Config;

use OpenApi\Annotations as OA;

/**
 * @OA\Info(
 *     title="Patient Port API",
 *     version="1.0.0",
 *     description="API Documentation for Patient Port System"
 * )
 * @OA\Server(
 *     url="http://localhost/patientport-latest/api",
 *     description="Local Development Server"
 * )
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 */
class OpenApiSpec {}

