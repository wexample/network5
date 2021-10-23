<?php

namespace App\Wex\BaseBundle\Tests;

use App\Wex\BaseBundle\Tests\Traits\LoggingTestCaseTrait;
use App\Wex\BaseBundle\Tests\Traits\WebTestCaseTrait;
use Symfony\Component\DomCrawler\Crawler;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\HttpKernelBrowser;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

abstract class WebTestCase extends \Symfony\Bundle\FrameworkBundle\Test\WebTestCase
{
    use LoggingTestCaseTrait;
    use WebTestCaseTrait;

    public const STATUS_CODE_SERVER_ERROR = 500;

    /**
     * @var bool \App\Kernel
     */
    public bool|KernelInterface $app = false;

    protected function setUp(): void
    {
        parent::setUp();

        $kernel = self::bootKernel();
        $this->app = $kernel;
    }

    public function goToRoute(
        string $route,
        array $args = [],
        array $parameters = []
    ): Crawler
    {
        $path = $this->url($route, $args);

        $this->log(
            'Convert route '.$route.' / '.json_encode($args),
            $this->LOGGING_COLOR_GRAY_DARK,
            $this->logIndentCursor + 1
        );

        $crawler = $this->go(
            $path,
            $parameters
        );

        $this->assertPageBodyHasNotOrphanTranslationKey(
            null,
            $crawler
        );

        return $crawler;
    }

    /**
     * @throws TransportExceptionInterface
     * @throws ServerExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ClientExceptionInterface
     */
    public function handleResponseError(Response|ResponseInterface $response, string $path)
    {
        if (self::STATUS_CODE_SERVER_ERROR === $response->getStatusCode()) {
            $this->debugWrite($response->getContent());
            $this->error(
                self::STATUS_CODE_SERVER_ERROR.' error for path : '.$path
            );
        }
    }

    abstract public function assertPageBodyHasNotOrphanTranslationKey(
        string $body = null,
        Crawler $crawler = null
    );

    public function getBody(Crawler $crawler = null): string
    {
        $crawler ??= $this->getCurrentCrawler();
        $body = $crawler->filter('body');

        if ($body->count()) {
            return $body->html();
        }

        return $this->getContent();
    }

    abstract public function getContent(): string;

    public function newClient(
        array $options = [],
        array $server = []
    ): ?HttpKernelBrowser
    {
        // Needed to be able to log user.
        $this->client = static::createClient($options, $server);
        $this->app->boot();

        return $this->client;
    }
}
