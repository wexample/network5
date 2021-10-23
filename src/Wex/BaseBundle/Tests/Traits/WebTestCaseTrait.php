<?php

namespace App\Wex\BaseBundle\Tests\Traits;

use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Component\DomCrawler\Crawler;

trait WebTestCaseTrait
{
    public ?KernelBrowser $client = null;

    /**
     * Return the root path of the website.
     */
    abstract public function getStorageDir(
        string $name = null
    ): string;

    abstract public function go(
        string $path,
        array $parameters = [],
        bool $quiet = false
    ): Crawler;

    /**
     * Generates an url from route.
     */
    abstract public function url(
        string $route,
        array $args = []
    ): string;
}
