<?php

$finder = (new PhpCsFixer\Finder())
    ->exclude('vendor')
    ->exclude('var')
    ->in(__DIR__)
;

return (new PhpCsFixer\Config())
    ->setRules([
        '@Symfony' => true,
        'array_syntax' => ['syntax' => 'short'],
        'binary_operator_spaces' => ['default' => 'align'],
        'braces' => ['position_after_control_structures' => 'next'],
        'concat_space' => ['spacing' => 'one'],
        'method_argument_space' => ['keep_multiple_spaces_after_comma' => true],
        'no_multiline_whitespace_around_double_arrow' => false,
        'no_superfluous_phpdoc_tags' => false,
        'yoda_style' => false,
    ])
    ->setFinder($finder)
;
