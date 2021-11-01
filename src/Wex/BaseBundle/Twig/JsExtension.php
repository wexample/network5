<?php

namespace App\Wex\BaseBundle\Twig;

use App\Wex\BaseBundle\Api\Dto\Traits\EntityDto;
use App\Wex\BaseBundle\Entity\Interfaces\AbstractEntityInterface;
use ReflectionClass;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Twig\TwigFunction;
use Twig\Extension\AbstractExtension;
use function class_exists;
use function is_array;
use function is_object;
use function is_subclass_of;

class JsExtension extends AbstractExtension
{
    public const VARS_GROUP_GLOBAL = 'global';

    public const VARS_GROUP_PAGE = 'page';

    protected array $jsVars = [
        self::VARS_GROUP_GLOBAL => [],
        self::VARS_GROUP_PAGE => [],
    ];

    /**
     * CommonExtension constructor.
     */
    public function __construct(
        private NormalizerInterface $normalizer,
    )
    {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'js_var',
                [
                    $this,
                    'jsVar',
                ]
            ),
            new TwigFunction(
                'js_vars',
                [
                    $this,
                    'jsVars',
                ]
            ),
        ];
    }

    public function jsVarExists(
        string $name,
        $group = self::VARS_GROUP_PAGE
    ): bool
    {
        return isset($this->jsVars[$group][$name]);
    }

    public function jsVarsGet(string $group): array
    {
        return $this->jsVars[$group];
    }

    /**
     * @throws ExceptionInterface
     */
    public function jsVars(
        array $array,
        string $group = self::VARS_GROUP_PAGE
    ): void
    {
        foreach ($array as $name => $value) {
            $this->jsVar($name, $value, $group);
        }
    }

    /**
     * @throws ExceptionInterface
     */
    public function jsVar(
        string $name,
        mixed $value,
        string $group = self::VARS_GROUP_PAGE
    ): void
    {
        $this->jsVars[$group][$name] = $this->serializeValue($value);
    }


    /**
     * @throws ExceptionInterface
     */
    public function serializeValue(mixed $item, $context = null): mixed
    {
        // Recursive exploration.
        if (is_array($item)) {
            return $this->serializeArray($item, $context);
        }

        // Convert entities.
        if ($entityDto = $this->serializeEntity($item, $context)) {
            return $entityDto;
        }

        return $item;
    }


    /**
     * @throws ExceptionInterface
     */
    public function serializeArray(
        array $array,
        array $context = null
    ): array
    {
        $output = [];

        foreach ($array as $key => $item) {
            $output[$key] = $this->serializeValue($item, $context);
        }

        return $output;
    }

    /**
     * @throws ExceptionInterface
     */
    public function serializeEntity(
        $value,
        ?array $context = [
            'displayFormat' => EntityDto::DISPLAY_FORMAT_DEFAULT,
        ]
    ): ?array
    {
        if (is_object($value) &&
            is_subclass_of(
                $value,
                AbstractEntityInterface::class
            )) {
            $objectValue = $value;
            // Find if class is an entity and have an API Dto object.
            $dtoClassName = '\\App\\Api\\Dto\\'.
                (new ReflectionClass($objectValue))->getShortName();

            if (!isset($context['collection_operation_name'])) {
                $context['collection_operation_name'] = 'twig_serialize_entity';
            }

            if (class_exists($dtoClassName) &&
                is_subclass_of($dtoClassName, EntityDto::class)) {
                return $this->normalizer->normalize(
                    $objectValue,
                    'jsonld',
                    $context
                );
            }
        }

        return null;
    }
}
