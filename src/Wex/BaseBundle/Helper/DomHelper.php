<?php

namespace App\Wex\BaseBundle\Helper;

use function implode;

class DomHelper
{
    public static function buildTagAttributes(array $attributes): string
    {
        $output = [];
        $attributes = $attributes ?: [];

        foreach ($attributes as $key => $value)
        {
            $output[] = $key.'="'.$value.'"';
        }

        return implode($output);
    }

    public static function buildTag(
        string $tagName,
        array $attributes,
        string $body = '',
        bool $allowSingleTag = true
    ): string {
        $output = '<'.$tagName.' '.static::buildTagAttributes($attributes);

        $outputAttributes = static::buildTagAttributes($attributes);
        $output .= $outputAttributes ? ' '.$outputAttributes : '';

        if ($allowSingleTag && !$body)
        {
            $output .= '/>';
        }
        else
        {
            $output .= '>'.$body.'</'.$tagName.'>';
        }

        return $output;
    }
}
