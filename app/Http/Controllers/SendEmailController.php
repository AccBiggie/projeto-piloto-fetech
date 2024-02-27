<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SendEmailController extends Controller
{
    /** 
     * Enviar E-mail contato function
     * 
     * @param Request $request
     *
    */
    public function sendEmail(Request $request){
        return dd($request);
    }
}
