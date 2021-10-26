<?php

namespace App\Wex\BaseBundle\Tests;

use function preg_match_all;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Component\DomCrawler\Crawler;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

abstract class SymfonyTestCase extends WebTestCase
{
    public string $pathPrevious;

    protected ?Request $requestCurrent = null;

    public function getStorageDir($name = null): string
    {
        return $this->app->getProjectDir().
            '/var/'.($name ? $name.'/' : '');
    }

    public function url($route, $args = []): string
    {
        $router = static::getContainer()->get('router');

        return $router->generate(
            $route,
            $args
        );
    }

    /**
     * @throws TransportExceptionInterface
     * @throws ServerExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ClientExceptionInterface
     */
    public function go(string $path, array $parameters = [], bool $quiet = false): Crawler
    {
        if (!$quiet)
        {
            $this->log('Go to '.$path);
        }

        // Store previous request for further usage.
        if ($this->requestCurrent)
        {
            $this->pathPrevious = $this->requestCurrent->getUri();
        }

        $this->client->request(
            'GET',
            $path,
            $parameters
        );

        $this->requestCurrent = $this->client->getRequest();

        $this->handleResponseError(
            $this->client->getResponse(),
            $path
        );

        return $this->getCurrentCrawler();
    }

    public function getCurrentCrawler(): ?Crawler
    {
        return $this->client?->getCrawler();
    }

    public function assertPageBodyHasNotOrphanTranslationKey(
        string $body = null,
        Crawler $crawler = null
    ) {
        preg_match_all(
            '/(.+)>([a-zA-Z0-9\.\n\t\s]+::[a-zA-Z0-9\.\n\t\s]+)<(.+)/',
            $body ?? $this->getBody($crawler),
            $output
        );

        if (!empty($output[2]))
        {
            $this->logArray($output);
        }

        $this->assertEmpty($output[2]);
    }

    public function getContent(): string
    {
        return $this->client->getResponse()->getContent();
    }

    protected static function createClient(array $options = [], array $server = []): KernelBrowser
    {
        self::ensureKernelShutdown();

        return parent::createClient($options, $server);
    }
}
