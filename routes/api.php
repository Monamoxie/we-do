<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/login',  'AuthController@login');
Route::post('/register',  'AuthController@register');

Route::post('/logout',  'AuthController@logout')->middleware('auth:api');

Route::get('/todos', 'TodosController@index');
Route::post('/todos', 'TodosController@store');
Route::patch('/todos/{todo}', 'TodosController@update');
Route::patch('/todos/check/all', 'TodosController@updateAll');
Route::delete('/todos/{todo}', 'TodosController@destroy');
Route::delete('/todos/delete/completed', 'TodosController@destroyCompleted');



