<?php

namespace App\Wex\BaseBundle\Tests\Traits;

use DateTime;
use function file_put_contents;
use function fwrite;
use function is_dir;
use function is_file;
use function is_null;
use function mkdir;
use function preg_match;
use function print_r;
use function str_repeat;
use function strpos;
use function substr;
use Symfony\Component\DomCrawler\Crawler;
use function unlink;

/**
 * Trait LoggingTestCase
 * Various debug and logging helper methods.
 */
trait LoggingTestCaseTrait
{
    protected string $LOGGING_COLOR_BLUE = '34';

    protected string $LOGGING_BG_COLOR_BLUE = '44';

    protected string $LOGGING_COLOR_CYAN = '36';

    protected string $LOGGING_COLOR_RED = '31';

    protected string $LOGGING_COLOR_GRAY_DARK = '90';

    protected string $LOGGING_COLOR_GRAY_LIGHT = '37';

    protected int $logIndentCursor = 0;

    public function log(string $message, string $color = null, int $indent = null)
    {
        $output = '';

        if ($color)
        {
            $output .= "\033[1;".$color.'m';
        }

        $output .= $message;
        if ($color)
        {
            $output .= "\033[0m";
        }

        fwrite(
            STDERR,
            str_repeat(
                '  ',
                is_null($indent) ? $this->logIndentCursor : $indent
            ).
            $output.
            PHP_EOL
        );
    }

    public function logArray(object|array $array)
    {
        $this->log(
            print_r($array, false)
        );
    }

    public function warn(string $message)
    {
        $this->log(
            $message,
            33
        );
    }

    public function debugContent(Crawler $crawler = null)
    {
        if (!$crawler)
        {
            $crawler = $this->getCurrentCrawler();
        }

        if (!$crawler)
        {
            $this->error('No crawler found in debug method !');
        }

        $body = $crawler->filter('body');

        $output = $body ? $body->html() : $this->getContent();

        echo PHP_EOL, '++++++++++++++++++++++++++',
        PHP_EOL, ' PATH :'.$this->client->getRequest()->getPathInfo(),
        PHP_EOL, ' CODE :'.$this->client->getResponse()->getStatusCode(),
        PHP_EOL;

        $exceptionMessagePosition = strpos($output, 'exception_message');
        $outputSuite = substr($output, $exceptionMessagePosition);
        if (false !== $exceptionMessagePosition)
        {
            preg_match(
                '/(?:exception_message">)([^<]*)(?:<\/span>)/',
                $outputSuite,
                $matches
            );
            echo ' Exception message : ', $matches[1];
            preg_match(
                '/<div class="block">.*?<\/div>/s',
                $outputSuite,
                $matches
            );

            echo PHP_EOL, ' Stack trace : ', PHP_EOL, $matches[0];
        }
        else
        {
            echo $output;
        }

        echo PHP_EOL, '++++++++++++++++++++++++++';
    }

    public function error(string $message, bool $fatal = true)
    {
        $this->log(
            $message,
            31
        );
        if ($fatal)
        {
            $this->fail($message);
        }
    }

    public function debugWrite(
        $body = null,
        $fileName = 'phpunit.debug.html',
        $quiet = false
    ) {
        $tmpDir = $this->initTempDir();

        $logFile = $tmpDir.$fileName;

        if (is_file($logFile))
        {
            unlink($logFile);
        }

        $output = $body ?: $this->getBody()
            // Error pages contains svg which breaks readability.
            .'<style> svg { display:none} </style>';

        if (!$quiet)
        {
            $this->info('See : '.$logFile);
        }

        file_put_contents(
            $logFile,
            'At '
            .(new DateTime())->format('Y-m-d H:i:s')
            .'<br><br>'
            .$output
        );
    }

    public function initTempDir(): string
    {
        $tmpDir = $this->getStorageDir('tmp');

        if (!is_dir($tmpDir))
        {
            mkdir($tmpDir, 0777, true);
        }

        return $tmpDir;
    }

    public function info(string $message)
    {
        $this->log(
            $message,
            34
        );
    }
}
