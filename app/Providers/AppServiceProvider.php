<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    /**
     * Limites por IP. O Nginx já barra rajadas antes de chegarem ao PHP;
     * estes limites são a segunda camada e valem por janela de tempo.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('web', function (Request $request) {
            return Limit::perMinute(config('security.rate_limits.web'))->by($request->ip());
        });

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(config('security.rate_limits.api'))->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('contact', function (Request $request) {
            return [
                Limit::perMinute(config('security.rate_limits.contact_per_minute'))->by('contact:minute:'.$request->ip()),
                Limit::perDay(config('security.rate_limits.contact_per_day'))->by('contact:day:'.$request->ip()),
            ];
        });
    }
}
