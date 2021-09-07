<?php

declare(strict_types=1);

use Rector\CodeQuality\Rector\Assign\CombinedAssignRector;
use Rector\CodeQuality\Rector\FuncCall\ArrayKeysAndInArrayToArrayKeyExistsRector;
use Rector\CodeQuality\Rector\Identical\BooleanNotIdenticalToNotIdenticalRector;
use Rector\CodeQuality\Rector\If_\CombineIfRector;
use Rector\CodeQuality\Rector\Ternary\ArrayKeyExistsTernaryThenValueToCoalescingRector;
use Rector\Core\Configuration\Option;
use Rector\Core\ValueObject\PhpVersion;
use Rector\Set\ValueObject\SetList;
use Rector\Symfony\Set\SwiftmailerSetList;
use Rector\Symfony\Set\SymfonySetList;
use Rector\Symfony\Set\TwigSetList;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return static function (ContainerConfigurator $containerConfigurator): void {
    // get parameters
    $parameters = $containerConfigurator->parameters();

    $parameters->set(
        Option::PHP_VERSION_FEATURES,
        PhpVersion::PHP_81
    );

    // paths to refactor; solid alternative to CLI arguments
    $parameters->set(Option::PATHS, [
        __DIR__ . '/src',
        __DIR__ . '/tests',
        __DIR__ . '/templates',
    ]);

    $services = $containerConfigurator->services();

    // Arrays.

    $services->set(
        ArrayKeyExistsTernaryThenValueToCoalescingRector::class
    );

    $services->set(
        ArrayKeysAndInArrayToArrayKeyExistsRector::class
    );

    $services->set(
        BooleanNotIdenticalToNotIdenticalRector::class
    );

    $services->set(
        CombineIfRector::class
    );

    $services->set(
        CombinedAssignRector::class
    );

    $containerConfigurator->import(SetList::DEAD_CODE);
    $containerConfigurator->import(SymfonySetList::SYMFONY_44);
    // $containerConfigurator->import(SymfonySetList::SYMFONY_52_VALIDATOR_ATTRIBUTES);
    $containerConfigurator->import(TwigSetList::TWIG_240);
    $containerConfigurator->import(SwiftmailerSetList::SWIFTMAILER_60);
    $containerConfigurator->import(Rector\Doctrine\Set\DoctrineSetList::DOCTRINE_CODE_QUALITY);
};
