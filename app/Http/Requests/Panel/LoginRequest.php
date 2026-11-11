<?php

namespace App\Http\Requests\Panel;

use App\Support\Recaptcha;
use Laravel\Fortify\Http\Requests\LoginRequest as FortifyLoginRequest;

class LoginRequest extends FortifyLoginRequest
{
    public function rules(): array
    {
        return parent::rules() + [
            'g-recaptcha-response' => ['required', 'string', 'max:8192'],
        ];
    }

    public function messages(): array
    {
        return parent::messages() + [
            'g-recaptcha-response.required' => 'Confirme que você não é um robô.',
            'g-recaptcha-response.string' => 'Verificação inválida. Confirme novamente que você não é um robô.',
            'g-recaptcha-response.max' => 'Verificação inválida. Confirme novamente que você não é um robô.',
        ];
    }

    protected function passedValidation(): void
    {
        app(Recaptcha::class)->verify($this->input('g-recaptcha-response'));
    }
}
