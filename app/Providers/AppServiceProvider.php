<?php

namespace App\Providers;

use App\Support\Seo;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\View as ViewFactory;
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
        $this->shareSeo();
    }

    /**
     * Meta do <head> do shell da SPA. Quem renderiza o shell pode mandar a própria meta (post, 404);
     * sem ela, vale a da rota atual.
     */
    protected function shareSeo(): void
    {
        ViewFactory::composer('app', function (View $view) {
            $seo = app(Seo::class);
            if (! array_key_exists('seo', $view->getData())) {
                $view->with('seo', $seo->page(request()->route()?->getName()));
            }
            $view->with('seoClient', Seo::json($seo->client()));
        });
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
