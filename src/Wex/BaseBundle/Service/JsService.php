<?php

namespace App\Wex\BaseBundle\Service;

use App\Wex\BaseBundle\Api\Dto\Traits\EntityDto;
use App\Wex\BaseBundle\Entity\Interfaces\AbstractEntityInterface;
use App\Wex\BaseBundle\Helper\RenderingHelper;
use ReflectionClass;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use function class_exists;
use function is_array;
use function is_object;
use function is_subclass_of;

class JsService
{
    public const VARS_GROUP_GLOBAL = 'global';

    public const VARS_GROUP_PAGE = 'page';

    // TODO Remove ?
    protected array $jsVars = [
        JsService::VARS_GROUP_GLOBAL => [],
        JsService::VARS_GROUP_PAGE => [],
    ];

    /**
     * CommonExtension constructor.
     */
    public function __construct(
        private NormalizerInterface $normalizer,
        private AdaptiveResponseService $adaptiveResponseService
    ) {
    }

    /**
     * @throws ExceptionInterface
     */
    public function jsVar(
        string $name,
        mixed $value,
    ): void {
        $this
            ->adaptiveResponseService
            ->renderPass
            ->getCurrentContextRenderNode()
            ->vars[$name] = $this->serializeValue($value);
    }

    public function jsVarExists(
        string $name,
        string $context = RenderingHelper::CONTEXT_PAGE
    ): bool {
        return isset($this->jsVars[$context][$name]);
    }

    /**
     * @throws ExceptionInterface
     */
    public function serializeValue(mixed $item, $context = null): mixed
    {
        // Recursive exploration.
        if (is_array($item))
        {
            return $this->serializeArray($item, $context);
        }

        // Convert entities.
        if ($entityDto = $this->serializeEntity($item, $context))
        {
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
    ): array {
        $output = [];

        foreach ($array as $key => $item)
        {
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
    ): ?array {
        if (is_object($value) &&
            is_subclass_of(
                $value,
                AbstractEntityInterface::class
            ))
        {
            $objectValue = $value;
            // Find if class is an entity and have an API Dto object.
            $dtoClassName = '\\App\\Api\\Dto\\'.
                (new ReflectionClass($objectValue))->getShortName();

            if (!isset($context['collection_operation_name']))
            {
                $context['collection_operation_name'] = 'twig_serialize_entity';
            }

            if (class_exists($dtoClassName) &&
                is_subclass_of($dtoClassName, EntityDto::class))
            {
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
