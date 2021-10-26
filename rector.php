<?php

declare(strict_types=1);

use ApiPlatform\Core\Annotation\ApiProperty;
use ApiPlatform\Core\Annotation\ApiResource;
use App\Wex\BaseBundle\Entity\Interfaces\LinkedToAnyEntityInterface;
use App\Wex\BaseBundle\Entity\Traits\LinkedToAnyEntity;
use Doctrine\ORM\Mapping\Column;
use Doctrine\ORM\Mapping\Entity;
use Doctrine\ORM\Mapping\GeneratedValue;
use Doctrine\ORM\Mapping\HasLifecycleCallbacks;
use Doctrine\ORM\Mapping\Id;
use Doctrine\ORM\Mapping\InheritanceType;
use Doctrine\ORM\Mapping\JoinColumn;
use Doctrine\ORM\Mapping\ManyToMany;
use Doctrine\ORM\Mapping\ManyToOne;
use Doctrine\ORM\Mapping\OneToMany;
use Doctrine\ORM\Mapping\OneToOne;
use Doctrine\ORM\Mapping\Table;
use Rector\CodingStyle\Rector\FuncCall\ConsistentPregDelimiterRector;
use Rector\Core\Configuration\Option;
use Rector\Core\ValueObject\PhpVersion;
use Rector\Doctrine\Rector\Class_\InitializeDefaultEntityCollectionRector;
use Rector\Doctrine\Rector\Class_\ManagerRegistryGetManagerToEntityManagerRector;
use Rector\Doctrine\Rector\Class_\MoveCurrentDateTimeDefaultInEntityToConstructorRector;
use Rector\Doctrine\Rector\Class_\RemoveRedundantDefaultClassAnnotationValuesRector;
use Rector\Doctrine\Rector\ClassMethod\MakeEntitySetterNullabilityInSyncWithPropertyRector;
use Rector\Doctrine\Rector\Property\ChangeBigIntEntityPropertyToIntTypeRector;
use Rector\Doctrine\Rector\Property\MakeEntityDateTimePropertyDateTimeInterfaceRector;
use Rector\Php74\Rector\Property\TypedPropertyRector;
use Rector\Php80\Rector\Class_\AnnotationToAttributeRector;
use Rector\Php80\ValueObject\AnnotationToAttribute;
use Rector\Privatization\Rector\MethodCall\ReplaceStringWithClassConstantRector;
use Rector\Privatization\ValueObject\ReplaceStringWithClassConstant;
use Rector\Symfony\Set\SwiftmailerSetList;
use Rector\Symfony\Set\SymfonySetList;
use Rector\Symfony\Set\TwigSetList;
use Rector\Transform\Rector\Class_\AddInterfaceByTraitRector;
use Rector\Transform\Rector\MethodCall\ServiceGetterToConstructorInjectionRector;
use Rector\Transform\ValueObject\ServiceGetterToConstructorInjection;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\DependencyInjection\Loader\Configurator\ServiceConfigurator;
use Symfony\Component\Routing\Annotation\Route;
use Symplify\SymfonyPhpConfig\ValueObjectInliner;

return static function (ContainerConfigurator $containerConfigurator): void {
    // Using this script in the wiki page : https://github.com/rectorphp/rector/blob/main/docs/rector_rules_overview.md#php70
    // To retrieve all available rules.
    //
    // var out = '';
    //
    // document.querySelectorAll('.markdown-body *').forEach((item) => {
    //   if (item.tagName === 'H2') {
    //     out += "\n\n// " + item.innerText;
    //   } else if (item.tagName === 'H3') {
    //     out += "\n// " + item.innerText;
    //   } else if (item.tagName === 'P') {
    //     out += "\n// " + item.innerText;
    //   } else if (item.tagName === 'UL') {
    //     var n = item.querySelector('ul li code');
    //
    //     if (n) {
    //       out += "\n" + n.innerText + "::class,";
    //     }
    //   }
    // });
    //
    // console.log(out);

    $allRules = [
        // Arguments
        // ArgumentAdderRector
        // This Rector adds new default arguments in calls of defined methods and class types.
        //  configure it!
        // Rector\Arguments\Rector\ClassMethod\ArgumentAdderRector::class,
        // FunctionArgumentDefaultValueReplacerRector
        // Streamline the operator arguments of version_compare function
        //  configure it!
        // Rector\Arguments\Rector\FuncCall\FunctionArgumentDefaultValueReplacerRector::class,
        // ReplaceArgumentDefaultValueRector
        // Replaces defined map of arguments in defined methods and their calls.
        //  configure it!
        // Rector\Arguments\Rector\ClassMethod\ReplaceArgumentDefaultValueRector::class,
        // SwapFuncCallArgumentsRector
        // Swap arguments in function calls
        //  configure it!
        // Rector\Arguments\Rector\FuncCall\SwapFuncCallArgumentsRector::class,

        // Autodiscovery
        // MoveEntitiesToEntityDirectoryRector
        // Move entities to Entity namespace
        // Rector\Autodiscovery\Rector\Class_\MoveEntitiesToEntityDirectoryRector::class,
        // MoveInterfacesToContractNamespaceDirectoryRector
        // Move interface to "Contract" namespace
        // Rector\Autodiscovery\Rector\Interface_\MoveInterfacesToContractNamespaceDirectoryRector::class,
        // MoveServicesBySuffixToDirectoryRector
        // Move classes by their suffix to their own group/directory
        //  configure it!
        // Rector\Autodiscovery\Rector\Class_\MoveServicesBySuffixToDirectoryRector::class,
        // MoveValueObjectsToValueObjectDirectoryRector
        // Move value object to ValueObject namespace/directory
        //  configure it!
        // Rector\Autodiscovery\Rector\Class_\MoveValueObjectsToValueObjectDirectoryRector::class,

        // Carbon
        // ChangeCarbonSingularMethodCallToPluralRector
        // Change setter methods with args to their plural names on Carbon\Carbon
        // Rector\Carbon\Rector\MethodCall\ChangeCarbonSingularMethodCallToPluralRector::class,
        // ChangeDiffForHumansArgsRector
        // Change methods arguments of diffForHumans() on Carbon\Carbon
        // Rector\Carbon\Rector\MethodCall\ChangeDiffForHumansArgsRector::class,

        // CodeQuality
        // AbsolutizeRequireAndIncludePathRector
        // include/require to absolute path. This Rector might introduce backwards incompatible code, when the include/require beeing changed depends on the current working directory.
        Rector\CodeQuality\Rector\Include_\AbsolutizeRequireAndIncludePathRector::class,
        // AddPregQuoteDelimiterRector
        // Add preg_quote delimiter when missing
        // Rector\CodeQuality\Rector\FuncCall\AddPregQuoteDelimiterRector::class,
        // AndAssignsToSeparateLinesRector
        // Split 2 assigns ands to separate line
        Rector\CodeQuality\Rector\LogicalAnd\AndAssignsToSeparateLinesRector::class,
        // ArrayKeyExistsTernaryThenValueToCoalescingRector
        // Change array_key_exists() ternary to coalesing
        Rector\CodeQuality\Rector\Ternary\ArrayKeyExistsTernaryThenValueToCoalescingRector::class,
        // ArrayKeysAndInArrayToArrayKeyExistsRector
        // Replace array_keys() and in_array() to array_key_exists()
        Rector\CodeQuality\Rector\FuncCall\ArrayKeysAndInArrayToArrayKeyExistsRector::class,
        // ArrayMergeOfNonArraysToSimpleArrayRector
        // Change array_merge of non arrays to array directly
        Rector\CodeQuality\Rector\FuncCall\ArrayMergeOfNonArraysToSimpleArrayRector::class,
        // ArrayThisCallToThisMethodCallRector
        // Change [$this, someMethod] without any args to $this->someMethod()
        // Rector\CodeQuality\Rector\Array_\ArrayThisCallToThisMethodCallRector::class,
        // BooleanNotIdenticalToNotIdenticalRector
        // Negated identical boolean compare to not identical compare (does not apply to non-bool values)
        Rector\CodeQuality\Rector\Identical\BooleanNotIdenticalToNotIdenticalRector::class,
        // CallUserFuncWithArrowFunctionToInlineRector
        // Refactor call_user_func() with arrow function to direct call
        // Rector\CodeQuality\Rector\FuncCall\CallUserFuncWithArrowFunctionToInlineRector::class,
        // CallableThisArrayToAnonymousFunctionRector
        // Convert [$this, "method"] to proper anonymous function
        // Rector\CodeQuality\Rector\Array_\CallableThisArrayToAnonymousFunctionRector::class,
        // ChangeArrayPushToArrayAssignRector
        // Change array_push() to direct variable assign
        Rector\CodeQuality\Rector\FuncCall\ChangeArrayPushToArrayAssignRector::class,
        // CombineIfRector
        // Merges nested if statements
        Rector\CodeQuality\Rector\If_\CombineIfRector::class,
        // CombinedAssignRector
        // Simplify $value = $value + 5; assignments to shorter ones
        Rector\CodeQuality\Rector\Assign\CombinedAssignRector::class,
        // CommonNotEqualRector
        // Use common != instead of less known <> with same meaning
        Rector\CodeQuality\Rector\NotEqual\CommonNotEqualRector::class,
        // CompactToVariablesRector
        // Change compact() call to own array
        Rector\CodeQuality\Rector\FuncCall\CompactToVariablesRector::class,
        // CompleteDynamicPropertiesRector
        // Add missing dynamic properties
        Rector\CodeQuality\Rector\Class_\CompleteDynamicPropertiesRector::class,
        // ConsecutiveNullCompareReturnsToNullCoalesceQueueRector
        // Change multiple null compares to ?? queue
        Rector\CodeQuality\Rector\If_\ConsecutiveNullCompareReturnsToNullCoalesceQueueRector::class,
        // DateTimeToDateTimeInterfaceRector
        // Changes DateTime type-hint to DateTimeInterface
        Rector\CodeQuality\Rector\ClassMethod\DateTimeToDateTimeInterfaceRector::class,
        // ExplicitBoolCompareRector
        // Make if conditions more explicit
        // Rector\CodeQuality\Rector\If_\ExplicitBoolCompareRector::class,
        // FixClassCaseSensitivityNameRector
        // Change miss-typed case sensitivity name to correct one
        // Rector\CodeQuality\Rector\Name\FixClassCaseSensitivityNameRector::class,
        // FlipTypeControlToUseExclusiveTypeRector
        // Flip type control to use exclusive type
        // Rector\CodeQuality\Rector\Identical\FlipTypeControlToUseExclusiveTypeRector::class,
        // ForRepeatedCountToOwnVariableRector
        // Change count() in for function to own variable
        Rector\CodeQuality\Rector\For_\ForRepeatedCountToOwnVariableRector::class,
        // ForToForeachRector
        // Change for() to foreach() where useful
        Rector\CodeQuality\Rector\For_\ForToForeachRector::class,
        // ForeachItemsAssignToEmptyArrayToAssignRector
        // Change foreach() items assign to empty array to direct assign
        Rector\CodeQuality\Rector\Foreach_\ForeachItemsAssignToEmptyArrayToAssignRector::class,
        // ForeachToInArrayRector
        // Simplify foreach loops into in_array when possible
        Rector\CodeQuality\Rector\Foreach_\ForeachToInArrayRector::class,
        // GetClassToInstanceOfRector
        // Changes comparison with get_class to instanceof
        // Rector\CodeQuality\Rector\Identical\GetClassToInstanceOfRector::class,
        // InArrayAndArrayKeysToArrayKeyExistsRector
        // Simplify in_array and array_keys functions combination into array_key_exists when array_keys has one argument only
        Rector\CodeQuality\Rector\FuncCall\InArrayAndArrayKeysToArrayKeyExistsRector::class,
        // InlineIfToExplicitIfRector
        // Change inline if to explicit if
        // Rector\CodeQuality\Rector\Expression\InlineIfToExplicitIfRector::class,
        // IntvalToTypeCastRector
        // Change intval() to faster and readable (int) $value
        Rector\CodeQuality\Rector\FuncCall\IntvalToTypeCastRector::class,
        // IsAWithStringWithThirdArgumentRector
        // Complete missing 3rd argument in case is_a() function in case of strings
        Rector\CodeQuality\Rector\FuncCall\IsAWithStringWithThirdArgumentRector::class,
        // IssetOnPropertyObjectToPropertyExistsRector
        // Change isset on property object to property_exists() and not null check
        // Rector\CodeQuality\Rector\Isset_\IssetOnPropertyObjectToPropertyExistsRector::class,
        // JoinStringConcatRector
        // Joins concat of 2 strings, unless the length is too long
        Rector\CodeQuality\Rector\Concat\JoinStringConcatRector::class,
        // LogicalToBooleanRector
        // Change OR, AND to ||, && with more common understanding
        Rector\CodeQuality\Rector\LogicalAnd\LogicalToBooleanRector::class,
        // NarrowUnionTypeDocRector
        // Changes docblock by narrowing type
        Rector\CodeQuality\Rector\ClassMethod\NarrowUnionTypeDocRector::class,
        // NewStaticToNewSelfRector
        // Change unsafe new static() to new self()
        Rector\CodeQuality\Rector\New_\NewStaticToNewSelfRector::class,
        // RemoveAlwaysTrueConditionSetInConstructorRector
        // If conditions is always true, perform the content right away
        Rector\CodeQuality\Rector\FunctionLike\RemoveAlwaysTrueConditionSetInConstructorRector::class,
        // RemoveSoleValueSprintfRector
        // Remove sprintf() wrapper if not needed
        Rector\CodeQuality\Rector\FuncCall\RemoveSoleValueSprintfRector::class,
        // SetTypeToCastRector
        // Changes settype() to (type) where possible
        Rector\CodeQuality\Rector\FuncCall\SetTypeToCastRector::class,
        // ShortenElseIfRector
        // Shortens else/if to elseif
        Rector\CodeQuality\Rector\If_\ShortenElseIfRector::class,
        // SimplifyArraySearchRector
        // Simplify array_search to in_array
        Rector\CodeQuality\Rector\Identical\SimplifyArraySearchRector::class,
        // SimplifyBoolIdenticalTrueRector
        // Simplify bool value compare to true or false
        Rector\CodeQuality\Rector\Identical\SimplifyBoolIdenticalTrueRector::class,
        // SimplifyConditionsRector
        // Simplify conditions
        Rector\CodeQuality\Rector\Identical\SimplifyConditionsRector::class,
        // SimplifyDeMorganBinaryRector
        // Simplify negated conditions with de Morgan theorem
        Rector\CodeQuality\Rector\BooleanNot\SimplifyDeMorganBinaryRector::class,
        // SimplifyDuplicatedTernaryRector
        // Remove ternary that duplicated return value of true : false
        Rector\CodeQuality\Rector\Ternary\SimplifyDuplicatedTernaryRector::class,
        // SimplifyEmptyArrayCheckRector
        // Simplify is_array and empty functions combination into a simple identical check for an empty array
        Rector\CodeQuality\Rector\BooleanAnd\SimplifyEmptyArrayCheckRector::class,
        // SimplifyForeachToArrayFilterRector
        // Simplify foreach with function filtering to array filter
        Rector\CodeQuality\Rector\Foreach_\SimplifyForeachToArrayFilterRector::class,
        // SimplifyForeachToCoalescingRector
        // Changes foreach that returns set value to ??
        Rector\CodeQuality\Rector\Foreach_\SimplifyForeachToCoalescingRector::class,
        // SimplifyFuncGetArgsCountRector
        // Simplify count of func_get_args() to func_num_args()
        Rector\CodeQuality\Rector\FuncCall\SimplifyFuncGetArgsCountRector::class,
        // SimplifyIfElseToTernaryRector
        // Changes if/else for same value as assign to ternary
        Rector\CodeQuality\Rector\If_\SimplifyIfElseToTernaryRector::class,
        // SimplifyIfIssetToNullCoalescingRector
        // Simplify binary if to null coalesce
        Rector\CodeQuality\Rector\If_\SimplifyIfIssetToNullCoalescingRector::class,
        // SimplifyIfNotNullReturnRector
        // Changes redundant null check to instant return
        Rector\CodeQuality\Rector\If_\SimplifyIfNotNullReturnRector::class,
        // SimplifyIfNullableReturnRector
        // Direct return on if nullable check before return
        Rector\CodeQuality\Rector\If_\SimplifyIfNullableReturnRector::class,
        // SimplifyIfReturnBoolRector
        // Shortens if return false/true to direct return
        Rector\CodeQuality\Rector\If_\SimplifyIfReturnBoolRector::class,
        // SimplifyInArrayValuesRector
        // Removes unneeded array_values() in in_array() call
        Rector\CodeQuality\Rector\FuncCall\SimplifyInArrayValuesRector::class,
        // SimplifyRegexPatternRector
        // Simplify regex pattern to known ranges
        Rector\CodeQuality\Rector\FuncCall\SimplifyRegexPatternRector::class,
        // SimplifyStrposLowerRector
        // Simplify strpos(strtolower(), "...") calls
        Rector\CodeQuality\Rector\FuncCall\SimplifyStrposLowerRector::class,
        // SimplifyTautologyTernaryRector
        // Simplify tautology ternary to value
        Rector\CodeQuality\Rector\Ternary\SimplifyTautologyTernaryRector::class,
        // SimplifyUselessVariableRector
        // Removes useless variable assigns
        Rector\CodeQuality\Rector\Return_\SimplifyUselessVariableRector::class,
        // SingleInArrayToCompareRector
        // Changes in_array() with single element to ===
        Rector\CodeQuality\Rector\FuncCall\SingleInArrayToCompareRector::class,
        // SingularSwitchToIfRector
        // Change switch with only 1 check to if
        Rector\CodeQuality\Rector\Switch_\SingularSwitchToIfRector::class,
        // SplitListAssignToSeparateLineRector
        // Splits [$a, $b] = [5, 10] scalar assign to standalone lines
        Rector\CodeQuality\Rector\Assign\SplitListAssignToSeparateLineRector::class,
        // StrlenZeroToIdenticalEmptyStringRector
        // Changes strlen comparison to 0 to direct empty string compare
        Rector\CodeQuality\Rector\Identical\StrlenZeroToIdenticalEmptyStringRector::class,
        // SwitchNegatedTernaryRector
        // Switch negated ternary condition rector
        Rector\CodeQuality\Rector\Ternary\SwitchNegatedTernaryRector::class,
        // ThrowWithPreviousExceptionRector
        // When throwing into a catch block, checks that the previous exception is passed to the new throw clause
        Rector\CodeQuality\Rector\Catch_\ThrowWithPreviousExceptionRector::class,
        // UnnecessaryTernaryExpressionRector
        // Remove unnecessary ternary expressions.
        Rector\CodeQuality\Rector\Ternary\UnnecessaryTernaryExpressionRector::class,
        // UnusedForeachValueToArrayKeysRector
        // Change foreach with unused $value but only $key, to array_keys()
        Rector\CodeQuality\Rector\Foreach_\UnusedForeachValueToArrayKeysRector::class,
        // UnwrapSprintfOneArgumentRector
        // unwrap sprintf() with one argument
        Rector\CodeQuality\Rector\FuncCall\UnwrapSprintfOneArgumentRector::class,
        // UseIdenticalOverEqualWithSameTypeRector
        // Use ===/!== over ==/!=, it values have the same type
        Rector\CodeQuality\Rector\Equal\UseIdenticalOverEqualWithSameTypeRector::class,

        // CodingStyle
        // AddArrayDefaultToArrayPropertyRector
        // Adds array default value to property to prevent foreach over null error
        Rector\CodingStyle\Rector\Class_\AddArrayDefaultToArrayPropertyRector::class,
        // AddFalseDefaultToBoolPropertyRector
        // Add false default to bool properties, to prevent null compare errors
        Rector\CodingStyle\Rector\Property\AddFalseDefaultToBoolPropertyRector::class,
        // BinarySwitchToIfElseRector
        // Changes switch with 2 options to if-else
        Rector\CodingStyle\Rector\Switch_\BinarySwitchToIfElseRector::class,
        // CallUserFuncArrayToVariadicRector
        // Replace call_user_func_array() with variadic
        Rector\CodingStyle\Rector\FuncCall\CallUserFuncArrayToVariadicRector::class,
        // CallUserFuncToMethodCallRector
        // Refactor call_user_func() on known class method to a method call
        Rector\CodingStyle\Rector\FuncCall\CallUserFuncToMethodCallRector::class,
        // CatchExceptionNameMatchingTypeRector
        // Type and name of catch exception should match
        Rector\CodingStyle\Rector\Catch_\CatchExceptionNameMatchingTypeRector::class,
        // ConsistentImplodeRector
        // Changes various implode forms to consistent one
        // Rector\CodingStyle\Rector\FuncCall\ConsistentImplodeRector::class,
        // ConsistentPregDelimiterRector
        // Replace PREG delimiter with configured one
        //  configure it!
        Rector\CodingStyle\Rector\FuncCall\ConsistentPregDelimiterRector::class => function ($configurator) {
            /* @var ServiceConfigurator $configurator */
            $configurator->call('configure', [[
                ConsistentPregDelimiterRector::DELIMITER => '/',
            ]]);
        },
        // CountArrayToEmptyArrayComparisonRector
        // Change count array comparison to empty array comparison to improve performance
        // Rector\CodingStyle\Rector\FuncCall\CountArrayToEmptyArrayComparisonRector::class,
        // EncapsedStringsToSprintfRector
        // Convert enscaped {$string} to more readable sprintf
        // Rector\CodingStyle\Rector\Encapsed\EncapsedStringsToSprintfRector::class,
        // FollowRequireByDirRector
        // include/require should be followed by absolute path
        Rector\CodingStyle\Rector\Include_\FollowRequireByDirRector::class,
        // FuncGetArgsToVariadicParamRector
        // Refactor func_get_args() in to a variadic param
        Rector\CodingStyle\Rector\ClassMethod\FuncGetArgsToVariadicParamRector::class,
        // MakeInheritedMethodVisibilitySameAsParentRector
        // Make method visibility same as parent one
        Rector\CodingStyle\Rector\ClassMethod\MakeInheritedMethodVisibilitySameAsParentRector::class,
        // ManualJsonStringToJsonEncodeArrayRector
        // Convert manual JSON string to JSON::encode array
        Rector\CodingStyle\Rector\Assign\ManualJsonStringToJsonEncodeArrayRector::class,
        // NewlineAfterStatementRector
        // Add new line after statements to tidify code
        Rector\CodingStyle\Rector\Stmt\NewlineAfterStatementRector::class,
        // NewlineBeforeNewAssignSetRector
        // Add extra space before new assign set
        Rector\CodingStyle\Rector\ClassMethod\NewlineBeforeNewAssignSetRector::class,
        // NullableCompareToNullRector
        // Changes negate of empty comparison of nullable value to explicit === or !== compare
        // Rector\CodingStyle\Rector\If_\NullableCompareToNullRector::class,
        // OrderAttributesRector
        // Order attributes by desired names
        //  configure it!
        // Rector\CodingStyle\Rector\ClassMethod\OrderAttributesRector::class,
        // PHPStormVarAnnotationRector
        // Change various @var annotation formats to one PHPStorm understands
        Rector\CodingStyle\Rector\Assign\PHPStormVarAnnotationRector::class,
        // PostIncDecToPreIncDecRector
        // Use ++$value or --$value instead of $value++ or $value--
        // Rector\CodingStyle\Rector\PostInc\PostIncDecToPreIncDecRector::class,
        // PreferThisOrSelfMethodCallRector
        // Changes $this->... and static:: to self:: or vise versa for given types
        //  configure it!
        // Rector\CodingStyle\Rector\MethodCall\PreferThisOrSelfMethodCallRector::class,
        // PreslashSimpleFunctionRector
        // Add pre-slash to short named functions to improve performance
        Rector\CodingStyle\Rector\FuncCall\PreslashSimpleFunctionRector::class,
        // RemoveDoubleUnderscoreInMethodNameRector
        // Non-magic PHP object methods cannot start with "__"
        Rector\CodingStyle\Rector\ClassMethod\RemoveDoubleUnderscoreInMethodNameRector::class,
        // RemoveUnusedAliasRector
        // Removes unused use aliases. Keep annotation aliases like "Doctrine\ORM\Mapping as ORM" to keep convention format
        Rector\CodingStyle\Rector\Use_\RemoveUnusedAliasRector::class,
        // ReturnArrayClassMethodToYieldRector
        // Turns array return to yield return in specific type and method
        //  configure it!
        // Rector\CodingStyle\Rector\ClassMethod\ReturnArrayClassMethodToYieldRector::class,
        // SeparateMultiUseImportsRector
        // Split multi use imports and trait statements to standalone lines
        Rector\CodingStyle\Rector\Use_\SeparateMultiUseImportsRector::class,
        // SplitDoubleAssignRector
        // Split multiple inline assigns to each own lines default value, to prevent undefined array issues
        // Rector\CodingStyle\Rector\Assign\SplitDoubleAssignRector::class,
        // SplitGroupedConstantsAndPropertiesRector
        // Separate constant and properties to own lines
        Rector\CodingStyle\Rector\ClassConst\SplitGroupedConstantsAndPropertiesRector::class,
        // SplitStringClassConstantToClassConstFetchRector
        // Separate class constant in a string to class constant fetch and string
        Rector\CodingStyle\Rector\String_\SplitStringClassConstantToClassConstFetchRector::class,
        // StrictArraySearchRector
        // Makes array_search search for identical elements
        Rector\CodingStyle\Rector\FuncCall\StrictArraySearchRector::class,
        // SymplifyQuoteEscapeRector
        // Prefer quote that are not inside the string
        // Rector\CodingStyle\Rector\String_\SymplifyQuoteEscapeRector::class,
        // TernaryConditionVariableAssignmentRector
        // Assign outcome of ternary condition to variable, where applicable
        Rector\CodingStyle\Rector\Ternary\TernaryConditionVariableAssignmentRector::class,
        // UnSpreadOperatorRector
        // Remove spread operator
        Rector\CodingStyle\Rector\ClassMethod\UnSpreadOperatorRector::class,
        // UseClassKeywordForClassNameResolutionRector
        // Use class keyword for class name resolution in string instead of hardcoded string reference
        Rector\CodingStyle\Rector\String_\UseClassKeywordForClassNameResolutionRector::class,
        // UseIncrementAssignRector
        // Use ++ increment instead of $var += 1
        // Rector\CodingStyle\Rector\Plus\UseIncrementAssignRector::class,
        // UseMessageVariableForSprintfInSymfonyStyleRector
        // Decouple $message property from sprintf() calls in $this->symfonyStyle->method()
        // Rector\CodingStyle\Rector\MethodCall\UseMessageVariableForSprintfInSymfonyStyleRector::class,
        // VarConstantCommentRector
        // Constant should have a @var comment with type
        // Rector\CodingStyle\Rector\ClassConst\VarConstantCommentRector::class,
        // VersionCompareFuncCallToConstantRector
        // Changes use of call to version compare function to use of PHP version constant
        Rector\CodingStyle\Rector\FuncCall\VersionCompareFuncCallToConstantRector::class,
        // WrapEncapsedVariableInCurlyBracesRector
        // Wrap encapsed variables in curly braces
        Rector\CodingStyle\Rector\Encapsed\WrapEncapsedVariableInCurlyBracesRector::class,

        // Composer
        // AddPackageToRequireComposerRector
        // Add package to "require" in composer.json
        //  configure it!
        // Rector\Composer\Rector\AddPackageToRequireComposerRector::class,
        // AddPackageToRequireDevComposerRector
        // Add package to "require-dev" in composer.json
        //  configure it!
        // Rector\Composer\Rector\AddPackageToRequireDevComposerRector::class,
        // ChangePackageVersionComposerRector
        // Change package version composer.json
        //  configure it!
        // Rector\Composer\Rector\ChangePackageVersionComposerRector::class,
        // RemovePackageComposerRector
        // Remove package from "require" and "require-dev" in composer.json
        //  configure it!
        // Rector\Composer\Rector\RemovePackageComposerRector::class,
        // RenamePackageComposerRector
        // Change package name in composer.json
        //  configure it!
        // Rector\Composer\Rector\RenamePackageComposerRector::class,
        // ReplacePackageAndVersionComposerRector
        // Change package name and version composer.json
        //  configure it!
        // Rector\Composer\Rector\ReplacePackageAndVersionComposerRector::class,

        // DeadCode
        // RecastingRemovalRector
        // Removes recasting of the same type
        Rector\DeadCode\Rector\Cast\RecastingRemovalRector::class,
        // RemoveAlwaysTrueIfConditionRector
        // Remove if condition that is always true
        Rector\DeadCode\Rector\If_\RemoveAlwaysTrueIfConditionRector::class,
        // RemoveAndTrueRector
        // Remove and true that has no added value
        Rector\DeadCode\Rector\BooleanAnd\RemoveAndTrueRector::class,
        // RemoveAnnotationRector
        // Remove annotation by names
        //  configure it!
        // Rector\DeadCode\Rector\ClassLike\RemoveAnnotationRector::class,
        // RemoveAssignOfVoidReturnFunctionRector
        // Remove assign of void function/method to variable
        Rector\DeadCode\Rector\Assign\RemoveAssignOfVoidReturnFunctionRector::class,
        // RemoveCodeAfterReturnRector
        // Remove dead code after return statement
        Rector\DeadCode\Rector\FunctionLike\RemoveCodeAfterReturnRector::class,
        // RemoveConcatAutocastRector
        // Remove (string) casting when it comes to concat, that does this by default
        Rector\DeadCode\Rector\Concat\RemoveConcatAutocastRector::class,
        // RemoveDeadConditionAboveReturnRector
        // Remove dead condition above return
        Rector\DeadCode\Rector\Return_\RemoveDeadConditionAboveReturnRector::class,
        // RemoveDeadConstructorRector
        // Remove empty constructor
        Rector\DeadCode\Rector\ClassMethod\RemoveDeadConstructorRector::class,
        // RemoveDeadIfForeachForRector
        // Remove if, foreach and for that does not do anything
        Rector\DeadCode\Rector\For_\RemoveDeadIfForeachForRector::class,
        // RemoveDeadInstanceOfRector
        // Remove dead instanceof check on type hinted variable
        Rector\DeadCode\Rector\If_\RemoveDeadInstanceOfRector::class,
        // RemoveDeadLoopRector
        // Remove loop with no body
        Rector\DeadCode\Rector\For_\RemoveDeadLoopRector::class,
        // RemoveDeadReturnRector
        // Remove last return in the functions, since does not do anything
        Rector\DeadCode\Rector\FunctionLike\RemoveDeadReturnRector::class,
        // RemoveDeadStmtRector
        // Removes dead code statements
        Rector\DeadCode\Rector\Expression\RemoveDeadStmtRector::class,
        // RemoveDeadTryCatchRector
        // Remove dead try/catch
        Rector\DeadCode\Rector\TryCatch\RemoveDeadTryCatchRector::class,
        // RemoveDeadZeroAndOneOperationRector
        // Remove operation with 1 and 0, that have no effect on the value
        Rector\DeadCode\Rector\Plus\RemoveDeadZeroAndOneOperationRector::class,
        // RemoveDelegatingParentCallRector
        // Removed dead parent call, that does not change anything
        Rector\DeadCode\Rector\ClassMethod\RemoveDelegatingParentCallRector::class,
        // RemoveDoubleAssignRector
        // Simplify useless double assigns
        Rector\DeadCode\Rector\Assign\RemoveDoubleAssignRector::class,
        // RemoveDuplicatedArrayKeyRector
        // Remove duplicated key in defined arrays.
        Rector\DeadCode\Rector\Array_\RemoveDuplicatedArrayKeyRector::class,
        // RemoveDuplicatedCaseInSwitchRector
        // 2 following switch keys with identical will be reduced to one result
        Rector\DeadCode\Rector\Switch_\RemoveDuplicatedCaseInSwitchRector::class,
        // RemoveDuplicatedIfReturnRector
        // Remove duplicated if stmt with return in function/method body
        Rector\DeadCode\Rector\FunctionLike\RemoveDuplicatedIfReturnRector::class,
        // RemoveDuplicatedInstanceOfRector
        // Remove duplicated instanceof in one call
        Rector\DeadCode\Rector\BinaryOp\RemoveDuplicatedInstanceOfRector::class,
        // RemoveEmptyClassMethodRector
        // Remove empty class methods not required by parents
        Rector\DeadCode\Rector\ClassMethod\RemoveEmptyClassMethodRector::class,
        // RemoveEmptyMethodCallRector
        // Remove empty method call
        Rector\DeadCode\Rector\MethodCall\RemoveEmptyMethodCallRector::class,
        // RemoveLastReturnRector
        // Remove very last return that has no meaning
        Rector\DeadCode\Rector\ClassMethod\RemoveLastReturnRector::class,
        // RemoveNonExistingVarAnnotationRector
        // Removes non-existing @var annotations above the code
        Rector\DeadCode\Rector\Node\RemoveNonExistingVarAnnotationRector::class,
        // RemoveNullPropertyInitializationRector
        // Remove initialization with null value from property declarations
        // /!\ Conflicting with PhpStorm tips.
        // Rector\DeadCode\Rector\PropertyProperty\RemoveNullPropertyInitializationRector::class,
        // RemoveOverriddenValuesRector
        // Remove initial assigns of overridden values
        Rector\DeadCode\Rector\FunctionLike\RemoveOverriddenValuesRector::class,
        // RemoveParentCallWithoutParentRector
        // Remove unused parent call with no parent class
        Rector\DeadCode\Rector\StaticCall\RemoveParentCallWithoutParentRector::class,
        // RemovePhpVersionIdCheckRector
        // Remove unneded PHP_VERSION_ID check
        //  configure it!
        // Rector\DeadCode\Rector\ConstFetch\RemovePhpVersionIdCheckRector::class,
        // RemoveUnreachableStatementRector
        // Remove unreachable statements
        Rector\DeadCode\Rector\Stmt\RemoveUnreachableStatementRector::class,
        // RemoveUnusedAssignVariableRector
        // Remove assigned unused variable
        // --> Great rule but is messing up comment and remove useful variables in loops.
        // Rector\DeadCode\Rector\Assign\RemoveUnusedAssignVariableRector::class,
        // RemoveUnusedConstructorParamRector
        // Remove unused parameter in constructor
        Rector\DeadCode\Rector\ClassMethod\RemoveUnusedConstructorParamRector::class,
        // RemoveUnusedForeachKeyRector
        // Remove unused key in foreach
        Rector\DeadCode\Rector\Foreach_\RemoveUnusedForeachKeyRector::class,
        // RemoveUnusedNonEmptyArrayBeforeForeachRector
        // Remove unused if check to non-empty array before foreach of the array
        Rector\DeadCode\Rector\If_\RemoveUnusedNonEmptyArrayBeforeForeachRector::class,
        // RemoveUnusedPrivateClassConstantRector
        // Remove unused class constants
        Rector\DeadCode\Rector\ClassConst\RemoveUnusedPrivateClassConstantRector::class,
        // RemoveUnusedPrivateMethodParameterRector
        // Remove unused parameter, if not required by interface or parent class
        Rector\DeadCode\Rector\ClassMethod\RemoveUnusedPrivateMethodParameterRector::class,
        // RemoveUnusedPrivateMethodRector
        // Remove unused private method
        Rector\DeadCode\Rector\ClassMethod\RemoveUnusedPrivateMethodRector::class,
        // RemoveUnusedPrivatePropertyRector
        // Remove unused private properties
        Rector\DeadCode\Rector\Property\RemoveUnusedPrivatePropertyRector::class,
        // RemoveUnusedPromotedPropertyRector
        // Remove unused promoted property
        Rector\DeadCode\Rector\ClassMethod\RemoveUnusedPromotedPropertyRector::class,
        // RemoveUnusedVariableAssignRector
        // Remove unused assigns to variables
        Rector\DeadCode\Rector\Assign\RemoveUnusedVariableAssignRector::class,
        // RemoveUselessParamTagRector
        // Remove @param docblock with same type as parameter type
        Rector\DeadCode\Rector\ClassMethod\RemoveUselessParamTagRector::class,
        // RemoveUselessReturnTagRector
        // Remove @return docblock with same type as defined in PHP
        Rector\DeadCode\Rector\ClassMethod\RemoveUselessReturnTagRector::class,
        // RemoveUselessVarTagRector
        // Remove unused @var annotation for properties
        Rector\DeadCode\Rector\Property\RemoveUselessVarTagRector::class,
        // SimplifyIfElseWithSameContentRector
        // Remove if/else if they have same content
        Rector\DeadCode\Rector\If_\SimplifyIfElseWithSameContentRector::class,
        // SimplifyMirrorAssignRector
        // Removes unneeded $a = $a assigns
        Rector\DeadCode\Rector\Expression\SimplifyMirrorAssignRector::class,
        // TernaryToBooleanOrFalseToBooleanAndRector
        // Change ternary of bool : false to && bool
        Rector\DeadCode\Rector\Ternary\TernaryToBooleanOrFalseToBooleanAndRector::class,
        // UnwrapFutureCompatibleIfFunctionExistsRector
        // Remove functions exists if with else for always existing
        Rector\DeadCode\Rector\If_\UnwrapFutureCompatibleIfFunctionExistsRector::class,
        // UnwrapFutureCompatibleIfPhpVersionRector
        // Remove php version checks if they are passed
        Rector\DeadCode\Rector\If_\UnwrapFutureCompatibleIfPhpVersionRector::class,

        // Defluent
        // DefluentReturnMethodCallRector
        // Turns return of fluent, to standalone call line and return of value
        // Rector\Defluent\Rector\Return_\DefluentReturnMethodCallRector::class,
        // FluentChainMethodCallToNormalMethodCallRector
        // Turns fluent interface calls to classic ones.
        // Rector\Defluent\Rector\MethodCall\FluentChainMethodCallToNormalMethodCallRector::class,
        // InArgFluentChainMethodCallToStandaloneMethodCallRector
        // Turns fluent interface calls to classic ones.
        // Rector\Defluent\Rector\MethodCall\InArgFluentChainMethodCallToStandaloneMethodCallRector::class,
        // MethodCallOnSetterMethodCallToStandaloneAssignRector
        // Change method call on setter to standalone assign before the setter
        // Rector\Defluent\Rector\MethodCall\MethodCallOnSetterMethodCallToStandaloneAssignRector::class,
        // NewFluentChainMethodCallToNonFluentRector
        // Turns fluent interface calls to classic ones.
        // Rector\Defluent\Rector\MethodCall\NewFluentChainMethodCallToNonFluentRector::class,
        // NormalToFluentRector
        // Turns fluent interface calls to classic ones.
        //  configure it!
        // Rector\Defluent\Rector\ClassMethod\NormalToFluentRector::class,
        // ReturnFluentChainMethodCallToNormalMethodCallRector
        // Turns fluent interface calls to classic ones.
        // Rector\Defluent\Rector\Return_\ReturnFluentChainMethodCallToNormalMethodCallRector::class,
        // ReturnNewFluentChainMethodCallToNonFluentRector
        // Turns fluent interface calls to classic ones.
        // Rector\Defluent\Rector\Return_\ReturnNewFluentChainMethodCallToNonFluentRector::class,
        // ReturnThisRemoveRector
        // Removes "return $this;" from fluent interfaces for specified classes.
        // Rector\Defluent\Rector\ClassMethod\ReturnThisRemoveRector::class,

        // DependencyInjection
        // ActionInjectionToConstructorInjectionRector
        // Turns action injection in Controllers to constructor injection
        // Rector\DependencyInjection\Rector\Class_\ActionInjectionToConstructorInjectionRector::class,
        // AddMethodParentCallRector
        // Add method parent call, in case new parent method is added
        //  configure it!
        // Rector\DependencyInjection\Rector\ClassMethod\AddMethodParentCallRector::class,
        // ReplaceVariableByPropertyFetchRector
        // Turns variable in controller action to property fetch, as follow up to action injection variable to property change.
        Rector\DependencyInjection\Rector\Variable\ReplaceVariableByPropertyFetchRector::class,

        // DowngradePhp53
        // DirConstToFileConstRector
        // Refactor DIR to dirname(FILE)
        // Rector\DowngradePhp53\Rector\Dir\DirConstToFileConstRector::class,

        // DowngradePhp70
        // DowngradeAnonymousClassRector
        // Remove anonymous class
        // Rector\DowngradePhp70\Rector\New_\DowngradeAnonymousClassRector::class,
        // DowngradeDefineArrayConstantRector
        // Change array constant definition via define to const
        Rector\DowngradePhp70\Rector\Expression\DowngradeDefineArrayConstantRector::class,
        // DowngradeGeneratedScalarTypesRector
        // Refactor scalar types in PHP code in string snippets, e.g. generated container code from symfony/dependency-injection
        // Rector\DowngradePhp70\Rector\String_\DowngradeGeneratedScalarTypesRector::class,
        // DowngradeNullCoalesceRector
        // Change null coalesce to isset ternary check
        // Rector\DowngradePhp70\Rector\Coalesce\DowngradeNullCoalesceRector::class,
        // DowngradeParentTypeDeclarationRector
        // Remove "parent" return type, add a "@return parent" tag instead
        // Rector\DowngradePhp70\Rector\ClassMethod\DowngradeParentTypeDeclarationRector::class,
        // DowngradeScalarTypeDeclarationRector
        // Remove the type params and return type, add @param and @return tags instead
        // Rector\DowngradePhp70\Rector\FunctionLike\DowngradeScalarTypeDeclarationRector::class,
        // DowngradeSelfTypeDeclarationRector
        // Remove "self" return type, add a "@return self" tag instead
        // Rector\DowngradePhp70\Rector\ClassMethod\DowngradeSelfTypeDeclarationRector::class,
        // DowngradeSessionStartArrayOptionsRector
        // Move array option of session_start($options) to before statement's ini_set()
        // Rector\DowngradePhp70\Rector\FuncCall\DowngradeSessionStartArrayOptionsRector::class,
        // DowngradeSpaceshipRector
        // Change spaceship with check equal, and ternary to result 0, -1, 1
        // Rector\DowngradePhp70\Rector\Spaceship\DowngradeSpaceshipRector::class,
        // DowngradeStrictTypeDeclarationRector
        // Remove the declare(strict_types=1)
        // Rector\DowngradePhp70\Rector\Declare_\DowngradeStrictTypeDeclarationRector::class,
        // SplitGroupedUseImportsRector
        // Refactor grouped use imports to standalone lines
        // Rector\DowngradePhp70\Rector\GroupUse\SplitGroupedUseImportsRector::class,

        // DowngradePhp71
        // DowngradeClassConstantVisibilityRector
        // Downgrade class constant visibility
        // Rector\DowngradePhp71\Rector\ClassConst\DowngradeClassConstantVisibilityRector::class,
        // DowngradeClosureFromCallableRector
        // Converts Closure::fromCallable() to compatible alternative.
        // Rector\DowngradePhp71\Rector\StaticCall\DowngradeClosureFromCallableRector::class,
        // DowngradeIsIterableRector
        // Change is_iterable with array and Traversable object type check
        // Rector\DowngradePhp71\Rector\FuncCall\DowngradeIsIterableRector::class,
        // DowngradeIterablePseudoTypeDeclarationRector
        // Remove the iterable pseudo type params and returns, add @param and @return tags instead
        // Rector\DowngradePhp71\Rector\FunctionLike\DowngradeIterablePseudoTypeDeclarationRector::class,
        // DowngradeKeysInListRector
        // Extract keys in list to its own variable assignment
        // Rector\DowngradePhp71\Rector\List_\DowngradeKeysInListRector::class,
        // DowngradeNegativeStringOffsetToStrlenRector
        // Downgrade negative string offset to strlen
        // Rector\DowngradePhp71\Rector\String_\DowngradeNegativeStringOffsetToStrlenRector::class,
        // DowngradeNullableTypeDeclarationRector
        // Remove the nullable type params, add @param tags instead
        // Rector\DowngradePhp71\Rector\FunctionLike\DowngradeNullableTypeDeclarationRector::class,
        // DowngradePipeToMultiCatchExceptionRector
        // Downgrade single one | separated to multi catch exception
        // Rector\DowngradePhp71\Rector\TryCatch\DowngradePipeToMultiCatchExceptionRector::class,
        // DowngradeVoidTypeDeclarationRector
        // Remove "void" return type, add a "@return void" tag instead
        // Rector\DowngradePhp71\Rector\FunctionLike\DowngradeVoidTypeDeclarationRector::class,
        // SymmetricArrayDestructuringToListRector
        // Downgrade Symmetric array destructuring to list() function
        // Rector\DowngradePhp71\Rector\Array_\SymmetricArrayDestructuringToListRector::class,

        // DowngradePhp72
        // DowngradeObjectTypeDeclarationRector
        // Remove the "object" param and return type, add a @param and @return tags instead
        // Rector\DowngradePhp72\Rector\FunctionLike\DowngradeObjectTypeDeclarationRector::class,
        // DowngradeParameterTypeWideningRector
        // Change param type to match the lowest type in whole family tree
        //  configure it!
        // Rector\DowngradePhp72\Rector\ClassMethod\DowngradeParameterTypeWideningRector::class,
        // DowngradePregUnmatchedAsNullConstantRector
        // Remove PREG_UNMATCHED_AS_NULL from preg_match and set null value on empty string matched on each match
        // Rector\DowngradePhp72\Rector\FuncCall\DowngradePregUnmatchedAsNullConstantRector::class,
        // DowngradeStreamIsattyRector
        // Downgrade stream_isatty() function
        // Rector\DowngradePhp72\Rector\FuncCall\DowngradeStreamIsattyRector::class,

        // DowngradePhp73
        // DowngradeArrayKeyFirstLastRector
        // Downgrade array_key_first() and array_key_last() functions
        // Rector\DowngradePhp73\Rector\FuncCall\DowngradeArrayKeyFirstLastRector::class,
        // DowngradeFlexibleHeredocSyntaxRector
        // Remove indentation from heredoc/nowdoc
        // Rector\DowngradePhp73\Rector\String_\DowngradeFlexibleHeredocSyntaxRector::class,
        // DowngradeIsCountableRector
        // Downgrade is_countable() to former version
        // Rector\DowngradePhp73\Rector\FuncCall\DowngradeIsCountableRector::class,
        // DowngradeListReferenceAssignmentRector
        // Convert the list reference assignment to its equivalent PHP 7.2 code
        // Rector\DowngradePhp73\Rector\List_\DowngradeListReferenceAssignmentRector::class,
        // DowngradeTrailingCommasInFunctionCallsRector
        // Remove trailing commas in function calls
        // Rector\DowngradePhp73\Rector\FuncCall\DowngradeTrailingCommasInFunctionCallsRector::class,
        // SetCookieOptionsArrayToArgumentsRector
        // Convert setcookie option array to arguments
        // Rector\DowngradePhp73\Rector\FuncCall\SetCookieOptionsArrayToArgumentsRector::class,

        // DowngradePhp74
        // ArrowFunctionToAnonymousFunctionRector
        // Replace arrow functions with anonymous functions
        // Rector\DowngradePhp74\Rector\ArrowFunction\ArrowFunctionToAnonymousFunctionRector::class,
        // DowngradeArrayMergeCallWithoutArgumentsRector
        // Add missing param to array_merge and array_merge_recursive
        // Rector\DowngradePhp74\Rector\FuncCall\DowngradeArrayMergeCallWithoutArgumentsRector::class,
        // DowngradeArraySpreadRector
        // Replace array spread with array_merge function
        // Rector\DowngradePhp74\Rector\Array_\DowngradeArraySpreadRector::class,
        // DowngradeContravariantArgumentTypeRector
        // Remove contravariant argument type declarations
        // Rector\DowngradePhp74\Rector\ClassMethod\DowngradeContravariantArgumentTypeRector::class,
        // DowngradeCovariantReturnTypeRector
        // Make method return same type as parent
        // Rector\DowngradePhp74\Rector\ClassMethod\DowngradeCovariantReturnTypeRector::class,
        // DowngradeFreadFwriteFalsyToNegationRector
        // Changes fread() or fwrite() compare to false to negation check
        // Rector\DowngradePhp74\Rector\Identical\DowngradeFreadFwriteFalsyToNegationRector::class,
        // DowngradeNullCoalescingOperatorRector
        // Remove null coalescing operator ??=
        // Rector\DowngradePhp74\Rector\Coalesce\DowngradeNullCoalescingOperatorRector::class,
        // DowngradeNumericLiteralSeparatorRector
        // Remove "_" as thousands separator in numbers
        // Rector\DowngradePhp74\Rector\LNumber\DowngradeNumericLiteralSeparatorRector::class,
        // DowngradeStripTagsCallWithArrayRector
        // Convert 2nd param to strip_tags from array to string
        // Rector\DowngradePhp74\Rector\FuncCall\DowngradeStripTagsCallWithArrayRector::class,
        // DowngradeTypedPropertyRector
        // Changes property type definition from type definitions to @var annotations.
        // Rector\DowngradePhp74\Rector\Property\DowngradeTypedPropertyRector::class,

        // DowngradePhp80
        // DowngradeAbstractPrivateMethodInTraitRector
        // Remove "abstract" from private methods in traits and adds an empty function body
        // Rector\DowngradePhp80\Rector\ClassMethod\DowngradeAbstractPrivateMethodInTraitRector::class,
        // DowngradeAttributeToAnnotationRector
        // Refactor PHP attribute markers to annotations notation
        //  configure it!
        // Rector\DowngradePhp80\Rector\Class_\DowngradeAttributeToAnnotationRector::class,
        // DowngradeClassOnObjectToGetClassRector
        // Change $object::class to get_class($object)
        // Rector\DowngradePhp80\Rector\ClassConstFetch\DowngradeClassOnObjectToGetClassRector::class,
        // DowngradeMatchToSwitchRector
        // Downgrade match() to switch()
        // Rector\DowngradePhp80\Rector\Expression\DowngradeMatchToSwitchRector::class,
        // DowngradeMixedTypeDeclarationRector
        // Remove the "mixed" param and return type, add a @param and @return tag instead
        // Rector\DowngradePhp80\Rector\FunctionLike\DowngradeMixedTypeDeclarationRector::class,
        // DowngradeNamedArgumentRector
        // Remove named argument
        // Rector\DowngradePhp80\Rector\MethodCall\DowngradeNamedArgumentRector::class,
        // DowngradeNonCapturingCatchesRector
        // Downgrade catch () without variable to one
        // Rector\DowngradePhp80\Rector\Catch_\DowngradeNonCapturingCatchesRector::class,
        // DowngradeNullsafeToTernaryOperatorRector
        // Change nullsafe operator to ternary operator rector
        // Rector\DowngradePhp80\Rector\NullsafeMethodCall\DowngradeNullsafeToTernaryOperatorRector::class,
        // DowngradePhpTokenRector
        // "something()" will be renamed to "somethingElse()"
        // Rector\DowngradePhp80\Rector\StaticCall\DowngradePhpTokenRector::class,
        // DowngradePropertyPromotionRector
        // Change constructor property promotion to property asssign
        // Rector\DowngradePhp80\Rector\Class_\DowngradePropertyPromotionRector::class,
        // DowngradeStaticTypeDeclarationRector
        // Remove "static" return and param type, add a "@param $this" and "@return $this" tag instead
        // Rector\DowngradePhp80\Rector\ClassMethod\DowngradeStaticTypeDeclarationRector::class,
        // DowngradeStrContainsRector
        // Replace str_contains() with strpos() !== false
        // Rector\DowngradePhp80\Rector\FuncCall\DowngradeStrContainsRector::class,
        // DowngradeStrEndsWithRector
        // Downgrade str_ends_with() to strncmp() version
        // Rector\DowngradePhp80\Rector\FuncCall\DowngradeStrEndsWithRector::class,
        // DowngradeStrStartsWithRector
        // Downgrade str_starts_with() to strncmp() version
        // Rector\DowngradePhp80\Rector\FuncCall\DowngradeStrStartsWithRector::class,
        // DowngradeThrowExprRector
        // Downgrade throw as expr
        // Rector\DowngradePhp80\Rector\Expression\DowngradeThrowExprRector::class,
        // DowngradeTrailingCommasInParamUseRector
        // Remove trailing commas in param or use list
        // Rector\DowngradePhp80\Rector\ClassMethod\DowngradeTrailingCommasInParamUseRector::class,
        // DowngradeUnionTypeDeclarationRector
        // Remove the union type params and returns, add @param/@return tags instead
        // Rector\DowngradePhp80\Rector\FunctionLike\DowngradeUnionTypeDeclarationRector::class,
        // DowngradeUnionTypeTypedPropertyRector
        // Removes union type property type definition, adding @var annotations instead.
        // Rector\DowngradePhp80\Rector\Property\DowngradeUnionTypeTypedPropertyRector::class,

        // DowngradePhp81
        // DowngradeFinalizePublicClassConstantRector
        // Remove final from class constants
        // Rector\DowngradePhp81\Rector\ClassConst\DowngradeFinalizePublicClassConstantRector::class,

        // EarlyReturn
        // ChangeAndIfToEarlyReturnRector
        // Changes if && to early return
        // Rector\EarlyReturn\Rector\If_\ChangeAndIfToEarlyReturnRector::class,
        // ChangeIfElseValueAssignToEarlyReturnRector
        // Change if/else value to early return
        // Rector\EarlyReturn\Rector\If_\ChangeIfElseValueAssignToEarlyReturnRector::class,
        // ChangeNestedForeachIfsToEarlyContinueRector
        // Change nested ifs to foreach with continue
        // Rector\EarlyReturn\Rector\Foreach_\ChangeNestedForeachIfsToEarlyContinueRector::class,
        // ChangeNestedIfsToEarlyReturnRector
        // Change nested ifs to early return
        // Rector\EarlyReturn\Rector\If_\ChangeNestedIfsToEarlyReturnRector::class,
        // ChangeOrIfContinueToMultiContinueRector
        // Changes if || to early return
        // Rector\EarlyReturn\Rector\If_\ChangeOrIfContinueToMultiContinueRector::class,
        // ChangeOrIfReturnToEarlyReturnRector
        // Changes if || with return to early return
        // Rector\EarlyReturn\Rector\If_\ChangeOrIfReturnToEarlyReturnRector::class,
        // PreparedValueToEarlyReturnRector
        // Return early prepared value in ifs
        // Rector\EarlyReturn\Rector\Return_\PreparedValueToEarlyReturnRector::class,
        // RemoveAlwaysElseRector
        // Split if statement, when if condition always break execution flow
        Rector\EarlyReturn\Rector\If_\RemoveAlwaysElseRector::class,
        // ReturnAfterToEarlyOnBreakRector
        // Change return after foreach to early return in foreach on break
        Rector\EarlyReturn\Rector\Foreach_\ReturnAfterToEarlyOnBreakRector::class,
        // ReturnBinaryAndToEarlyReturnRector
        // Changes Single return of && to early returns
        // Rector\EarlyReturn\Rector\Return_\ReturnBinaryAndToEarlyReturnRector::class,
        // ReturnBinaryOrToEarlyReturnRector
        // Changes Single return of || to early returns
        // Rector\EarlyReturn\Rector\Return_\ReturnBinaryOrToEarlyReturnRector::class,

        // Generics
        // GenericClassMethodParamRector
        // Make class methods generic based on implemented interface
        //  configure it!
        // Rector\Generics\Rector\ClassMethod\GenericClassMethodParamRector::class,

        // LeagueEvent
        // DispatchStringToObjectRector
        // Change string events to anonymous class which implement \League\Event\HasEventName
        // Rector\LeagueEvent\Rector\MethodCall\DispatchStringToObjectRector::class,

        // MockeryToProphecy
        // MockeryCloseRemoveRector
        // Removes mockery close from test classes
        // Rector\MockeryToProphecy\Rector\StaticCall\MockeryCloseRemoveRector::class,
        // MockeryCreateMockToProphizeRector
        // Changes mockery mock creation to Prophesize
        // Rector\MockeryToProphecy\Rector\ClassMethod\MockeryCreateMockToProphizeRector::class,

        // MysqlToMysqli
        // MysqlAssignToMysqliRector
        // Converts more complex mysql functions to mysqli
        // Rector\MysqlToMysqli\Rector\Assign\MysqlAssignToMysqliRector::class,
        // MysqlFuncCallToMysqliRector
        // Converts more complex mysql functions to mysqli
        // Rector\MysqlToMysqli\Rector\FuncCall\MysqlFuncCallToMysqliRector::class,
        // MysqlPConnectToMysqliConnectRector
        // Replace mysql_pconnect() with mysqli_connect() with host p: prefix
        // Rector\MysqlToMysqli\Rector\FuncCall\MysqlPConnectToMysqliConnectRector::class,
        // MysqlQueryMysqlErrorWithLinkRector
        // Add mysql_query and mysql_error with connection
        // Rector\MysqlToMysqli\Rector\FuncCall\MysqlQueryMysqlErrorWithLinkRector::class,

        // Naming
        // RenameForeachValueVariableToMatchExprVariableRector
        // Renames value variable name in foreach loop to match expression variable
        // Rector\Naming\Rector\Foreach_\RenameForeachValueVariableToMatchExprVariableRector::class,
        // RenameForeachValueVariableToMatchMethodCallReturnTypeRector
        // Renames value variable name in foreach loop to match method type
        Rector\Naming\Rector\Foreach_\RenameForeachValueVariableToMatchMethodCallReturnTypeRector::class,
        // RenameParamToMatchTypeRector
        // Rename param to match ClassType
        // Rector\Naming\Rector\ClassMethod\RenameParamToMatchTypeRector::class,
        // RenamePropertyToMatchTypeRector
        // Rename property and method param to match its type
        // Rector\Naming\Rector\Class_\RenamePropertyToMatchTypeRector::class,
        // RenameVariableToMatchMethodCallReturnTypeRector
        // Rename variable to match method return type
        // Rector\Naming\Rector\Assign\RenameVariableToMatchMethodCallReturnTypeRector::class,
        // RenameVariableToMatchNewTypeRector
        // Rename variable to match new ClassType
        // Rector\Naming\Rector\ClassMethod\RenameVariableToMatchNewTypeRector::class,

        // Order
        // OrderPrivateMethodsByUseRector
        // Order private methods in order of their use
        Rector\Order\Rector\Class_\OrderPrivateMethodsByUseRector::class,

        // PSR4
        // MultipleClassFileToPsr4ClassesRector
        // Change multiple classes in one file to standalone PSR-4 classes.
        // Rector\PSR4\Rector\Namespace_\MultipleClassFileToPsr4ClassesRector::class,
        // NormalizeNamespaceByPSR4ComposerAutoloadRector
        // Adds namespace to namespace-less files or correct namespace to match PSR-4 in composer.json autoload section. Run with combination with "Rector\PSR4\Rector\Namespace_\MultipleClassFileToPsr4ClassesRector"
        // Rector\PSR4\Rector\FileWithoutNamespace\NormalizeNamespaceByPSR4ComposerAutoloadRector::class,
        // class: Rector\PSR4\Rector\FileWithoutNamespace\NormalizeNamespaceByPSR4ComposerAutoloadRector
        // with composer.json:

        // Php52
        // ContinueToBreakInSwitchRector
        // Use break instead of continue in switch statements
        Rector\Php52\Rector\Switch_\ContinueToBreakInSwitchRector::class,
        // VarToPublicPropertyRector
        // Change property modifier from var to public
        Rector\Php52\Rector\Property\VarToPublicPropertyRector::class,

        // Php53
        // ClearReturnNewByReferenceRector
        // Remove reference from "$assign = &new Value;"
        // Rector\Php53\Rector\AssignRef\ClearReturnNewByReferenceRector::class,
        // DirNameFileConstantToDirConstantRector
        // Convert dirname(FILE) to DIR
        Rector\Php53\Rector\FuncCall\DirNameFileConstantToDirConstantRector::class,
        // ReplaceHttpServerVarsByServerRector
        // Rename old $HTTP_* variable names to new replacements
        // Rector\Php53\Rector\Variable\ReplaceHttpServerVarsByServerRector::class,
        // TernaryToElvisRector
        // Use ?: instead of ?, where useful
        Rector\Php53\Rector\Ternary\TernaryToElvisRector::class,

        // Php54
        // RemoveReferenceFromCallRector
        // Remove & from function and method calls
        Rector\Php54\Rector\FuncCall\RemoveReferenceFromCallRector::class,
        // RemoveZeroBreakContinueRector
        // Remove 0 from break and continue
        // Rector\Php54\Rector\Break_\RemoveZeroBreakContinueRector::class,

        // Php55
        // ClassConstantToSelfClassRector
        // Change __CLASS__ to self::class
        // Rector\Php55\Rector\Class_\ClassConstantToSelfClassRector::class,
        // PregReplaceEModifierRector
        // The /e modifier is no longer supported, use preg_replace_callback instead
        // Rector\Php55\Rector\FuncCall\PregReplaceEModifierRector::class,
        // StringClassNameToClassConstantRector
        // Replace string class names by ::class constant
        //  configure it!
        // Rector\Php55\Rector\String_\StringClassNameToClassConstantRector::class,

        // Php56
        // AddDefaultValueForUndefinedVariableRector
        // Adds default value for undefined variable
        Rector\Php56\Rector\FunctionLike\AddDefaultValueForUndefinedVariableRector::class,
        // PowToExpRector
        // Changes pow(val, val2) to ** (exp) parameter
        // Rector\Php56\Rector\FuncCall\PowToExpRector::class,

        // Php70
        // BreakNotInLoopOrSwitchToReturnRector
        // Convert break outside for/foreach/switch context to return
        // Rector\Php70\Rector\Break_\BreakNotInLoopOrSwitchToReturnRector::class,
        // CallUserMethodRector
        // Changes call_user_method()/call_user_method_array() to call_user_func()/call_user_func_array()
        // Rector\Php70\Rector\FuncCall\CallUserMethodRector::class,
        // EmptyListRector
        // list() cannot be empty
        // Rector\Php70\Rector\List_\EmptyListRector::class,
        // EregToPregMatchRector
        // Changes ereg*() to preg*() calls
        // Rector\Php70\Rector\FuncCall\EregToPregMatchRector::class,
        // ExceptionHandlerTypehintRector
        // Change typehint from Exception to Throwable.
        // Rector\Php70\Rector\FunctionLike\ExceptionHandlerTypehintRector::class,
        // IfToSpaceshipRector
        // Changes if/else to spaceship <=> where useful
        // Rector\Php70\Rector\If_\IfToSpaceshipRector::class,
        // ListSplitStringRector
        // list() cannot split string directly anymore, use str_split()
        // Rector\Php70\Rector\Assign\ListSplitStringRector::class,
        // ListSwapArrayOrderRector
        // list() assigns variables in reverse order - relevant in array assign
        // Rector\Php70\Rector\Assign\ListSwapArrayOrderRector::class,
        // MultiDirnameRector
        // Changes multiple dirname() calls to one with nesting level
        // Rector\Php70\Rector\FuncCall\MultiDirnameRector::class,
        // NonVariableToVariableOnFunctionCallRector
        // Transform non variable like arguments to variable where a function or method expects an argument passed by reference
        // Rector\Php70\Rector\FuncCall\NonVariableToVariableOnFunctionCallRector::class,
        // Php4ConstructorRector
        // Changes PHP 4 style constructor to __construct.
        // Rector\Php70\Rector\ClassMethod\Php4ConstructorRector::class,
        // RandomFunctionRector
        // Changes rand, srand and getrandmax by new mt_* alternatives.
        Rector\Php70\Rector\FuncCall\RandomFunctionRector::class,
        // ReduceMultipleDefaultSwitchRector
        // Remove first default switch, that is ignored
        Rector\Php70\Rector\Switch_\ReduceMultipleDefaultSwitchRector::class,
        // RenameMktimeWithoutArgsToTimeRector
        // Renames mktime() without arguments to time()
        Rector\Php70\Rector\FuncCall\RenameMktimeWithoutArgsToTimeRector::class,
        // StaticCallOnNonStaticToInstanceCallRector
        // Changes static call to instance call, where not useful
        Rector\Php70\Rector\StaticCall\StaticCallOnNonStaticToInstanceCallRector::class,
        // TernaryToNullCoalescingRector
        // Changes unneeded null check to ?? operator
        Rector\Php70\Rector\Ternary\TernaryToNullCoalescingRector::class,
        // TernaryToSpaceshipRector
        // Use <=> spaceship instead of ternary with same effect
        Rector\Php70\Rector\Ternary\TernaryToSpaceshipRector::class,
        // ThisCallOnStaticMethodToStaticCallRector
        // Changes $this->call() to static method to static call
        Rector\Php70\Rector\MethodCall\ThisCallOnStaticMethodToStaticCallRector::class,
        // WrapVariableVariableNameInCurlyBracesRector
        // Ensure variable variables are wrapped in curly braces
        Rector\Php70\Rector\Variable\WrapVariableVariableNameInCurlyBracesRector::class,

        // Php71
        // AssignArrayToStringRector
        // String cannot be turned into array by assignment anymore
        Rector\Php71\Rector\Assign\AssignArrayToStringRector::class,
        // BinaryOpBetweenNumberAndStringRector
        // Change binary operation between some number + string to PHP 7.1 compatible version
        // Rector\Php71\Rector\BinaryOp\BinaryOpBetweenNumberAndStringRector::class,
        // CountOnNullRector
        // Changes count() on null to safe ternary check
        // Rector\Php71\Rector\FuncCall\CountOnNullRector::class,
        // IsIterableRector
        // Changes is_array + Traversable check to is_iterable
        // Rector\Php71\Rector\BooleanOr\IsIterableRector::class,
        // ListToArrayDestructRector
        // Change list() to array destruct
        // Rector\Php71\Rector\List_\ListToArrayDestructRector::class,
        // MultiExceptionCatchRector
        // Changes multi catch of same exception to single one | separated.
        // Rector\Php71\Rector\TryCatch\MultiExceptionCatchRector::class,
        // PublicConstantVisibilityRector
        // Add explicit public constant visibility.
        Rector\Php71\Rector\ClassConst\PublicConstantVisibilityRector::class,
        // RemoveExtraParametersRector
        // Remove extra parameters
        Rector\Php71\Rector\FuncCall\RemoveExtraParametersRector::class,
        // ReservedObjectRector
        // Changes reserved "Object" name to "Object" where can be configured
        //  configure it!
        // Rector\Php71\Rector\Name\ReservedObjectRector::class,

        // Php72
        // CreateFunctionToAnonymousFunctionRector
        // Use anonymous functions instead of deprecated create_function()
        // Rector\Php72\Rector\FuncCall\CreateFunctionToAnonymousFunctionRector::class,
        // GetClassOnNullRector
        // Null is no more allowed in get_class()
        // Rector\Php72\Rector\FuncCall\GetClassOnNullRector::class,
        // IsObjectOnIncompleteClassRector
        // Incomplete class returns inverted bool on is_object()
        // Rector\Php72\Rector\FuncCall\IsObjectOnIncompleteClassRector::class,
        // ListEachRector
        // each() function is deprecated, use key() and current() instead
        // Rector\Php72\Rector\Assign\ListEachRector::class,
        // ParseStrWithResultArgumentRector
        // Use $result argument in parse_str() function
        // Rector\Php72\Rector\FuncCall\ParseStrWithResultArgumentRector::class,
        // ReplaceEachAssignmentWithKeyCurrentRector
        // Replace each() assign outside loop
        // Rector\Php72\Rector\Assign\ReplaceEachAssignmentWithKeyCurrentRector::class,
        // StringifyDefineRector
        // Make first argument of define() string
        // Rector\Php72\Rector\FuncCall\StringifyDefineRector::class,
        // StringsAssertNakedRector
        // String asserts must be passed directly to assert()
        // Rector\Php72\Rector\FuncCall\StringsAssertNakedRector::class,
        // UnsetCastRector
        // Removes (unset) cast
        // Rector\Php72\Rector\Unset_\UnsetCastRector::class,
        // WhileEachToForeachRector
        // each() function is deprecated, use foreach() instead.
        // Rector\Php72\Rector\While_\WhileEachToForeachRector::class,

        // Php73
        // ArrayKeyFirstLastRector
        // Make use of array_key_first() and array_key_last()
        // Rector\Php73\Rector\FuncCall\ArrayKeyFirstLastRector::class,
        // IsCountableRector
        // Changes is_array + Countable check to is_countable
        // Rector\Php73\Rector\BooleanOr\IsCountableRector::class,
        // JsonThrowOnErrorRector
        // Adds JSON_THROW_ON_ERROR to json_encode() and json_decode() to throw JsonException on error
        // Rector\Php73\Rector\FuncCall\JsonThrowOnErrorRector::class,
        // RegexDashEscapeRector
        // Escape - in some cases
        // Rector\Php73\Rector\FuncCall\RegexDashEscapeRector::class,
        // SensitiveConstantNameRector
        // Changes case insensitive constants to sensitive ones.
        // Rector\Php73\Rector\ConstFetch\SensitiveConstantNameRector::class,
        // SensitiveDefineRector
        // Changes case insensitive constants to sensitive ones.
        // Rector\Php73\Rector\FuncCall\SensitiveDefineRector::class,
        // SensitiveHereNowDocRector
        // Changes heredoc/nowdoc that contains closing word to safe wrapper name
        // Rector\Php73\Rector\String_\SensitiveHereNowDocRector::class,
        // SetCookieRector
        // Convert setcookie argument to PHP7.3 option array
        // Rector\Php73\Rector\FuncCall\SetCookieRector::class,
        // StringifyStrNeedlesRector
        // Makes needles explicit strings
        // Rector\Php73\Rector\FuncCall\StringifyStrNeedlesRector::class,

        // Php74
        // AddLiteralSeparatorToNumberRector
        // Add "_" as thousands separator in numbers for higher or equals to limitValue config
        //  configure it!
        // Rector\Php74\Rector\LNumber\AddLiteralSeparatorToNumberRector::class,
        // ArrayKeyExistsOnPropertyRector
        // Change array_key_exists() on property to property_exists()
        // Rector\Php74\Rector\FuncCall\ArrayKeyExistsOnPropertyRector::class,
        // ArraySpreadInsteadOfArrayMergeRector
        // Change array_merge() to spread operator, except values with possible string key values
        // Rector\Php74\Rector\FuncCall\ArraySpreadInsteadOfArrayMergeRector::class,
        // ChangeReflectionTypeToStringToGetNameRector
        // Change string calls on ReflectionType
        // Rector\Php74\Rector\MethodCall\ChangeReflectionTypeToStringToGetNameRector::class,
        // ClosureToArrowFunctionRector
        // Change closure to arrow function
        // Rector\Php74\Rector\Closure\ClosureToArrowFunctionRector::class,
        // CurlyToSquareBracketArrayStringRector
        // Change curly based array and string to square bracket
        Rector\Php74\Rector\ArrayDimFetch\CurlyToSquareBracketArrayStringRector::class,
        // ExportToReflectionFunctionRector
        // Change export() to ReflectionFunction alternatives
        // Rector\Php74\Rector\StaticCall\ExportToReflectionFunctionRector::class,
        // FilterVarToAddSlashesRector
        // Change filter_var() with slash escaping to addslashes()
        // Rector\Php74\Rector\FuncCall\FilterVarToAddSlashesRector::class,
        // GetCalledClassToStaticClassRector
        // Change get_called_class() to static::class
        // Rector\Php74\Rector\FuncCall\GetCalledClassToStaticClassRector::class,
        // MbStrrposEncodingArgumentPositionRector
        // Change mb_strrpos() encoding argument position
        // Rector\Php74\Rector\FuncCall\MbStrrposEncodingArgumentPositionRector::class,
        // NullCoalescingOperatorRector
        // Use null coalescing operator ??=
        Rector\Php74\Rector\Assign\NullCoalescingOperatorRector::class,
        // RealToFloatTypeCastRector
        // Change deprecated (real) to (float)
        // Rector\Php74\Rector\Double\RealToFloatTypeCastRector::class,
        // ReservedFnFunctionRector
        // Change fn() function name, since it will be reserved keyword
        //  configure it!
        // Rector\Php74\Rector\Function_\ReservedFnFunctionRector::class,
        // RestoreDefaultNullToNullableTypePropertyRector
        // Add null default to properties with PHP 7.4 property nullable type
        Rector\Php74\Rector\Property\RestoreDefaultNullToNullableTypePropertyRector::class,
        // TypedPropertyRector
        // Changes property @var annotations from annotation to type.
        //  configure it!
        Rector\Php74\Rector\Property\TypedPropertyRector::class => function ($configurator) {
            /* @var ServiceConfigurator $configurator */
            $configurator->call('configure', [[
                TypedPropertyRector::CLASS_LIKE_TYPE_ONLY => false,
                TypedPropertyRector::PRIVATE_PROPERTY_ONLY => false,
            ]]);
        },

        // Php80
        // AnnotationToAttributeRector
        // Change annotation to attribute
        //  configure it!
        Rector\Php80\Rector\Class_\AnnotationToAttributeRector::class => function ($configurator) {
            $configurator->call('configure', [[
                AnnotationToAttributeRector::ANNOTATION_TO_ATTRIBUTE => ValueObjectInliner::inline([
                    // Symfony
                    new AnnotationToAttribute(Route::class),
                    new AnnotationToAttribute(UniqueEntity::class),
                    new AnnotationToAttribute(IsGranted::class),
                    new AnnotationToAttribute(ParamConverter::class),

                    // Doctrine
                    new AnnotationToAttribute(Column::class),
                    new AnnotationToAttribute(Entity::class),
                    new AnnotationToAttribute(GeneratedValue::class),
                    new AnnotationToAttribute(HasLifecycleCallbacks::class),
                    new AnnotationToAttribute(Id::class),
                    new AnnotationToAttribute(InheritanceType::class),
                    new AnnotationToAttribute(JoinColumn::class),
                    new AnnotationToAttribute(ManyToMany::class),
                    new AnnotationToAttribute(ManyToOne::class),
                    new AnnotationToAttribute(OneToOne::class),
                    new AnnotationToAttribute(OneToMany::class),
                    new AnnotationToAttribute(Table::class),

                    // Api
                    new AnnotationToAttribute(ApiResource::class),
                    new AnnotationToAttribute(ApiProperty::class),

                    // Various
                    new AnnotationToAttribute(\App\Wex\BaseBundle\Validator\Constraints\File::class),
                ]),
            ]]);
        },
        // ChangeSwitchToMatchRector
        // Change switch() to match()
        Rector\Php80\Rector\Switch_\ChangeSwitchToMatchRector::class,
        // ClassOnObjectRector
        // Change get_class($object) to faster $object::class
        Rector\Php80\Rector\FuncCall\ClassOnObjectRector::class,
        // ClassPropertyAssignToConstructorPromotionRector
        // Change simple property init and assign to constructor promotion
        Rector\Php80\Rector\Class_\ClassPropertyAssignToConstructorPromotionRector::class,
        // DoctrineAnnotationClassToAttributeRector
        // Refactor Doctrine @annotation annotated class to a PHP 8.0 attribute class
        //  configure it!
        Rector\Php80\Rector\Class_\DoctrineAnnotationClassToAttributeRector::class,
        // FinalPrivateToPrivateVisibilityRector
        // Changes method visibility from final private to only private
        Rector\Php80\Rector\ClassMethod\FinalPrivateToPrivateVisibilityRector::class,
        // GetDebugTypeRector
        // Change ternary type resolve to get_debug_type()
        // Rector\Php80\Rector\Ternary\GetDebugTypeRector::class,
        // OptionalParametersAfterRequiredRector
        // Move required parameters after optional ones
        // /!\ Inverting on wrong situations
        // Rector\Php80\Rector\ClassMethod\OptionalParametersAfterRequiredRector::class,
        // RemoveUnusedVariableInCatchRector
        // Remove unused variable in catch()
        Rector\Php80\Rector\Catch_\RemoveUnusedVariableInCatchRector::class,
        // SetStateToStaticRector
        // Adds static visibility to __set_state() methods
        // Rector\Php80\Rector\ClassMethod\SetStateToStaticRector::class,
        // StrContainsRector
        // Replace strpos() !== false and strstr() with str_contains()
        Rector\Php80\Rector\NotIdentical\StrContainsRector::class,
        // StrEndsWithRector
        // Change helper functions to str_ends_with()
        Rector\Php80\Rector\Identical\StrEndsWithRector::class,
        // StrStartsWithRector
        // Change helper functions to str_starts_with()
        Rector\Php80\Rector\Identical\StrStartsWithRector::class,
        // StringableForToStringRector
        // Add Stringable interface to classes with __toString() method
        Rector\Php80\Rector\Class_\StringableForToStringRector::class,
        // TokenGetAllToObjectRector
        // Convert token_get_all to PhpToken::tokenize
        // Rector\Php80\Rector\FuncCall\TokenGetAllToObjectRector::class,
        // UnionTypesRector
        // Change docs types to union types, where possible (properties are covered by TypedPropertiesRector)
        Rector\Php80\Rector\FunctionLike\UnionTypesRector::class,

        // Php81
        // /!\ Seems to early for that.
        // FinalizePublicClassConstantRector
        // Add final to constants that
        // Rector\Php81\Rector\ClassConst\FinalizePublicClassConstantRector::class,
        // MyCLabsClassToEnumRector
        // Refactor MyCLabs enum class to native Enum
        // Rector\Php81\Rector\Class_\MyCLabsClassToEnumRector::class,
        // MyCLabsMethodCallToEnumConstRector
        // Refactor MyCLabs enum fetch to Enum const
        // Rector\Php81\Rector\MethodCall\MyCLabsMethodCallToEnumConstRector::class,
        // ReadOnlyPropertyRector
        // Decorate read-only property with readonly attribute
        // Rector\Php81\Rector\Property\ReadOnlyPropertyRector::class,
        // SpatieEnumClassToEnumRector
        // Refactor Spatie enum class to native Enum
        // Rector\Php81\Rector\Class_\SpatieEnumClassToEnumRector::class,

        // PhpSpecToPHPUnit
        // AddMockPropertiesRector
        // Migrate PhpSpec behavior to PHPUnit test
        // Rector\PhpSpecToPHPUnit\Rector\Class_\AddMockPropertiesRector::class,
        // MockVariableToPropertyFetchRector
        // Migrate PhpSpec behavior to PHPUnit test
        // Rector\PhpSpecToPHPUnit\Rector\Variable\MockVariableToPropertyFetchRector::class,
        // PhpSpecClassToPHPUnitClassRector
        // Migrate PhpSpec behavior to PHPUnit test
        // Rector\PhpSpecToPHPUnit\Rector\Class_\PhpSpecClassToPHPUnitClassRector::class,
        // PhpSpecMethodToPHPUnitMethodRector
        // Migrate PhpSpec behavior to PHPUnit test
        // Rector\PhpSpecToPHPUnit\Rector\ClassMethod\PhpSpecMethodToPHPUnitMethodRector::class,
        // PhpSpecMocksToPHPUnitMocksRector
        // Migrate PhpSpec behavior to PHPUnit test
        // Rector\PhpSpecToPHPUnit\Rector\MethodCall\PhpSpecMocksToPHPUnitMocksRector::class,
        // PhpSpecPromisesToPHPUnitAssertRector
        // Migrate PhpSpec behavior to PHPUnit test
        // Rector\PhpSpecToPHPUnit\Rector\MethodCall\PhpSpecPromisesToPHPUnitAssertRector::class,
        // RenameSpecFileToTestFileRector
        // Rename "*Spec.php" file to "*Test.php" file
        // Rector\PhpSpecToPHPUnit\Rector\Class_\RenameSpecFileToTestFileRector::class,

        // PostRector
        // ClassRenamingPostRector
        // Rename references for classes that were renamed during Rector run
        Rector\PostRector\Rector\ClassRenamingPostRector::class,
        // NameImportingPostRector
        // Imports fully qualified names
        Rector\PostRector\Rector\NameImportingPostRector::class,
        // NodeAddingPostRector
        // Add nodes on weird positions
        // Rector\PostRector\Rector\NodeAddingPostRector::class,
        // NodeRemovingPostRector
        // Remove nodes from weird positions
        // Rector\PostRector\Rector\NodeRemovingPostRector::class,
        // NodeToReplacePostRector
        // Replaces nodes on weird positions
        // Rector\PostRector\Rector\NodeToReplacePostRector::class,
        // PropertyAddingPostRector
        // Add dependency properties
        Rector\PostRector\Rector\PropertyAddingPostRector::class,
        // UseAddingPostRector
        // Add unique use imports collected during Rector run
        Rector\PostRector\Rector\UseAddingPostRector::class,

        // Privatization
        // /!\ Quite too violent
        // ChangeGlobalVariablesToPropertiesRector
        // Change global $variables to private properties
        // Rector\Privatization\Rector\ClassMethod\ChangeGlobalVariablesToPropertiesRector::class,
        // ChangeLocalPropertyToVariableRector
        // Change local property used in single method to local variable
        // Rector\Privatization\Rector\Class_\ChangeLocalPropertyToVariableRector::class,
        // ChangeReadOnlyPropertyWithDefaultValueToConstantRector
        // Change property with read only status with default value to constant
        // Rector\Privatization\Rector\Property\ChangeReadOnlyPropertyWithDefaultValueToConstantRector::class,
        // ChangeReadOnlyVariableWithDefaultValueToConstantRector
        // Change variable with read only status with default value to constant
        // Rector\Privatization\Rector\Class_\ChangeReadOnlyVariableWithDefaultValueToConstantRector::class,
        // FinalizeClassesWithoutChildrenRector
        // Finalize every class that has no children
        // Rector\Privatization\Rector\Class_\FinalizeClassesWithoutChildrenRector::class,
        // PrivatizeFinalClassMethodRector
        // Change protected class method to private if possible
        // Rector\Privatization\Rector\ClassMethod\PrivatizeFinalClassMethodRector::class,
        // PrivatizeFinalClassPropertyRector
        // Change property to private if possible
        // Rector\Privatization\Rector\Property\PrivatizeFinalClassPropertyRector::class,
        // PrivatizeLocalGetterToPropertyRector
        // Privatize getter of local property to property
        // Rector\Privatization\Rector\MethodCall\PrivatizeLocalGetterToPropertyRector::class,
        // RepeatedLiteralToClassConstantRector
        // Replace repeated strings with constant
        Rector\Privatization\Rector\Class_\RepeatedLiteralToClassConstantRector::class,
        // ReplaceStringWithClassConstantRector
        // Replace string values in specific method call by constant of provided class
        //  configure it!
        // Rector\Privatization\Rector\MethodCall\ReplaceStringWithClassConstantRector::class,

        // Removing
        // ArgumentRemoverRector
        // Removes defined arguments in defined methods and their calls.
        //  configure it!
        // Rector\Removing\Rector\ClassMethod\ArgumentRemoverRector::class,
        // RemoveFuncCallArgRector
        // Remove argument by position by function name
        //  configure it!
        // Rector\Removing\Rector\FuncCall\RemoveFuncCallArgRector::class,
        // RemoveFuncCallRector
        // Remove ini_get by configuration
        //  configure it!
        // Rector\Removing\Rector\FuncCall\RemoveFuncCallRector::class,
        // RemoveInterfacesRector
        // Removes interfaces usage from class.
        //  configure it!
        // Rector\Removing\Rector\Class_\RemoveInterfacesRector::class,
        // RemoveParentRector
        // Removes extends class by name
        //  configure it!
        // Rector\Removing\Rector\Class_\RemoveParentRector::class,
        // RemoveTraitUseRector
        // Remove specific traits from code
        //  configure it!
        // Rector\Removing\Rector\Class_\RemoveTraitUseRector::class,

        // RemovingStatic
        // DesiredClassTypeToDynamicRector
        // Change full static service, to dynamic one
        // Rector\RemovingStatic\Rector\Class_\DesiredClassTypeToDynamicRector::class,
        // DesiredPropertyClassMethodTypeToDynamicRector
        // Change defined static properties and methods to dynamic
        // Rector\RemovingStatic\Rector\Property\DesiredPropertyClassMethodTypeToDynamicRector::class,
        // DesiredStaticCallTypeToDynamicRector
        // Change defined static service to dynamic one
        // Rector\RemovingStatic\Rector\StaticCall\DesiredStaticCallTypeToDynamicRector::class,
        // DesiredStaticPropertyFetchTypeToDynamicRector
        // Change defined static service to dynamic one
        // Rector\RemovingStatic\Rector\StaticPropertyFetch\DesiredStaticPropertyFetchTypeToDynamicRector::class,
        // LocallyCalledStaticMethodToNonStaticRector
        // Change static method and local-only calls to non-static
        // Rector\RemovingStatic\Rector\ClassMethod\LocallyCalledStaticMethodToNonStaticRector::class,

        // Renaming
        // PseudoNamespaceToNamespaceRector
        // Replaces defined Pseudo_Namespaces by Namespace\Ones.
        //  configure it!
        // Rector\Renaming\Rector\FileWithoutNamespace\PseudoNamespaceToNamespaceRector::class,
        // RenameAnnotationRector
        // Turns defined annotations above properties and methods to their new values.
        //  configure it!
        // Rector\Renaming\Rector\ClassMethod\RenameAnnotationRector::class,
        // RenameClassConstFetchRector
        // Replaces defined class constants in their calls.
        //  configure it!
        // Rector\Renaming\Rector\ClassConstFetch\RenameClassConstFetchRector::class,
        // RenameClassRector
        // Replaces defined classes by new ones.
        //  configure it!
        // Rector\Renaming\Rector\Name\RenameClassRector::class,
        // RenameConstantRector
        // Replace constant by new ones
        //  configure it!
        // Rector\Renaming\Rector\ConstFetch\RenameConstantRector::class,
        // RenameFunctionRector
        // Turns defined function call new one.
        //  configure it!
        // Rector\Renaming\Rector\FuncCall\RenameFunctionRector::class,
        // RenameMethodRector
        // Turns method names to new ones.
        //  configure it!
        // Rector\Renaming\Rector\MethodCall\RenameMethodRector::class,
        // RenameNamespaceRector
        // Replaces old namespace by new one.
        //  configure it!
        // Rector\Renaming\Rector\Namespace_\RenameNamespaceRector::class,
        // RenamePropertyRector
        // Replaces defined old properties by new ones.
        //  configure it!
        // Rector\Renaming\Rector\PropertyFetch\RenamePropertyRector::class,
        // RenameStaticMethodRector
        // Turns method names to new ones.
        //  configure it!
        // Rector\Renaming\Rector\StaticCall\RenameStaticMethodRector::class,
        // RenameStringRector
        // Change string value
        //  configure it!
        // Rector\Renaming\Rector\String_\RenameStringRector::class,

        // Restoration
        // CompleteImportForPartialAnnotationRector
        // In case you have accidentally removed use imports but code still contains partial use statements, this will save you
        //  configure it!
        // Rector\Restoration\Rector\Namespace_\CompleteImportForPartialAnnotationRector::class,
        // InferParamFromClassMethodReturnRector
        // Change @param doc based on another method return type
        //  configure it!
        // Rector\Restoration\Rector\ClassMethod\InferParamFromClassMethodReturnRector::class,
        // MakeTypedPropertyNullableIfCheckedRector
        // Make typed property nullable if checked
        // Rector\Restoration\Rector\Property\MakeTypedPropertyNullableIfCheckedRector::class,
        // MissingClassConstantReferenceToStringRector
        // Convert missing class reference to string
        // Rector\Restoration\Rector\ClassConstFetch\MissingClassConstantReferenceToStringRector::class,
        // RemoveFinalFromEntityRector
        // Remove final from Doctrine entities
        // Rector\Restoration\Rector\Class_\RemoveFinalFromEntityRector::class,
        // UpdateFileNameByClassNameFileSystemRector
        // Rename file to respect class name
        // Rector\Restoration\Rector\ClassLike\UpdateFileNameByClassNameFileSystemRector::class,

        // Transform
        // AddInterfaceByParentRector
        // Add interface by parent
        //  configure it!
        // Rector\Transform\Rector\Class_\AddInterfaceByParentRector::class,
        // AddInterfaceByTraitRector
        // Add interface by used trait
        //  configure it!
        Rector\Transform\Rector\Class_\AddInterfaceByTraitRector::class => function ($configurator) {
            /* @var ServiceConfigurator $configurator */
            $configurator->call('configure', [[
                AddInterfaceByTraitRector::INTERFACE_BY_TRAIT => [
                    LinkedToAnyEntity::class => LinkedToAnyEntityInterface::class,
                ], ]]);
        },
        // ArgumentFuncCallToMethodCallRector
        // Move help facade-like function calls to constructor injection
        //  configure it!
        // Rector\Transform\Rector\FuncCall\ArgumentFuncCallToMethodCallRector::class,
        // CallableInMethodCallToVariableRector
        // Change a callable in method call to standalone variable assign
        //  configure it!
        // Rector\Transform\Rector\MethodCall\CallableInMethodCallToVariableRector::class,
        // ChangeSingletonToServiceRector
        // Change singleton class to normal class that can be registered as a service
        // Rector\Transform\Rector\Class_\ChangeSingletonToServiceRector::class,
        // ClassConstFetchToValueRector
        // Replaces constant by value
        //  configure it!
        // Rector\Transform\Rector\ClassConstFetch\ClassConstFetchToValueRector::class,
        // DimFetchAssignToMethodCallRector
        // Change magic array access add to $list[], to explicit $list->addMethod(...)
        //  configure it!
        // Rector\Transform\Rector\Assign\DimFetchAssignToMethodCallRector::class,
        // FuncCallToConstFetchRector
        // Changes use of function calls to use constants
        //  configure it!
        // Rector\Transform\Rector\FuncCall\FuncCallToConstFetchRector::class,
        // FuncCallToMethodCallRector
        // Turns defined function calls to local method calls.
        //  configure it!
        // Rector\Transform\Rector\FuncCall\FuncCallToMethodCallRector::class,
        // FuncCallToNewRector
        // Change configured function calls to new Instance
        //  configure it!
        // Rector\Transform\Rector\FuncCall\FuncCallToNewRector::class,
        // FuncCallToStaticCallRector
        // Turns defined function call to static method call.
        //  configure it!
        // Rector\Transform\Rector\FuncCall\FuncCallToStaticCallRector::class,
        // GetAndSetToMethodCallRector
        // Turns defined __get/__set to specific method calls.
        //  configure it!
        // Rector\Transform\Rector\Assign\GetAndSetToMethodCallRector::class,
        // MergeInterfacesRector
        // Merges old interface to a new one, that already has its methods
        //  configure it!
        // Rector\Transform\Rector\Class_\MergeInterfacesRector::class,
        // MethodCallToAnotherMethodCallWithArgumentsRector
        // Turns old method call with specific types to new one with arguments
        //  configure it!
        // Rector\Transform\Rector\MethodCall\MethodCallToAnotherMethodCallWithArgumentsRector::class,
        // MethodCallToMethodCallRector
        // Change method one method from one service to a method call to in another service
        //  configure it!
        // Rector\Transform\Rector\MethodCall\MethodCallToMethodCallRector::class,
        // MethodCallToPropertyFetchRector
        // Turns method call "$this->something()" to property fetch "$this->something"
        //  configure it!
        // Rector\Transform\Rector\MethodCall\MethodCallToPropertyFetchRector::class,
        // MethodCallToStaticCallRector
        // Change method call to desired static call
        //  configure it!
        // Rector\Transform\Rector\MethodCall\MethodCallToStaticCallRector::class,
        // NewArgToMethodCallRector
        // Change new with specific argument to method call
        //  configure it!
        // Rector\Transform\Rector\New_\NewArgToMethodCallRector::class,
        // NewToConstructorInjectionRector
        // Change defined new type to constructor injection
        //  configure it!
        // Rector\Transform\Rector\New_\NewToConstructorInjectionRector::class,
        // NewToMethodCallRector
        // Replaces creating object instances with "new" keyword with factory method.
        //  configure it!
        // Rector\Transform\Rector\New_\NewToMethodCallRector::class,
        // NewToStaticCallRector
        // Change new Object to static call
        //  configure it!
        // Rector\Transform\Rector\New_\NewToStaticCallRector::class,
        // ParentClassToTraitsRector
        // Replaces parent class to specific traits
        //  configure it!
        // Rector\Transform\Rector\Class_\ParentClassToTraitsRector::class,
        // PropertyAssignToMethodCallRector
        // Turns property assign of specific type and property name to method call
        //  configure it!
        // Rector\Transform\Rector\Assign\PropertyAssignToMethodCallRector::class,
        // PropertyFetchToMethodCallRector
        // Replaces properties assign calls be defined methods.
        //  configure it!
        // Rector\Transform\Rector\Assign\PropertyFetchToMethodCallRector::class,
        // ReplaceParentCallByPropertyCallRector
        // Changes method calls in child of specific types to defined property method call
        //  configure it!
        // Rector\Transform\Rector\MethodCall\ReplaceParentCallByPropertyCallRector::class,
        // ServiceGetterToConstructorInjectionRector
        // Get service call to constructor injection
        //  configure it!
        // Rector\Transform\Rector\MethodCall\ServiceGetterToConstructorInjectionRector::class,
        // SingleToManyMethodRector
        // Change method that returns single value to multiple values
        //  configure it!
        // Rector\Transform\Rector\ClassMethod\SingleToManyMethodRector::class,
        // StaticCallToFuncCallRector
        // Turns static call to function call.
        //  configure it!
        // Rector\Transform\Rector\StaticCall\StaticCallToFuncCallRector::class,
        // StaticCallToMethodCallRector
        // Change static call to service method via constructor injection
        //  configure it!
        // Rector\Transform\Rector\StaticCall\StaticCallToMethodCallRector::class,
        // StaticCallToNewRector
        // Change static call to new instance
        //  configure it!
        // Rector\Transform\Rector\StaticCall\StaticCallToNewRector::class,
        // StringToClassConstantRector
        // Changes strings to specific constants
        //  configure it!
        // Rector\Transform\Rector\String_\StringToClassConstantRector::class,
        // ToStringToMethodCallRector
        // Turns defined code uses of "__toString()" method to specific method calls.
        //  configure it!
        // Rector\Transform\Rector\String_\ToStringToMethodCallRector::class,
        // UnsetAndIssetToMethodCallRector
        // Turns defined __isset/__unset calls to specific method calls.
        //  configure it!
        // Rector\Transform\Rector\Isset_\UnsetAndIssetToMethodCallRector::class,
        // WrapReturnRector
        // Wrap return value of specific method
        //  configure it!
        // Rector\Transform\Rector\ClassMethod\WrapReturnRector::class,

        // TypeDeclaration
        // AddArrayParamDocTypeRector
        // Adds @param annotation to array parameters inferred from the rest of the code
        // Rector\TypeDeclaration\Rector\ClassMethod\AddArrayParamDocTypeRector::class,
        // AddArrayReturnDocTypeRector
        // Adds @return annotation to array parameters inferred from the rest of the code
        // Rector\TypeDeclaration\Rector\ClassMethod\AddArrayReturnDocTypeRector::class,
        // AddClosureReturnTypeRector
        // Add known return type to functions
        Rector\TypeDeclaration\Rector\Closure\AddClosureReturnTypeRector::class,
        // AddMethodCallBasedStrictParamTypeRector
        // Change param type to strict type of passed expression
        //  configure it!
        // Rector\TypeDeclaration\Rector\ClassMethod\AddMethodCallBasedStrictParamTypeRector::class,
        // AddParamTypeDeclarationRector
        // Add param types where needed
        //  configure it!
        // Rector\TypeDeclaration\Rector\ClassMethod\AddParamTypeDeclarationRector::class,
        // AddReturnTypeDeclarationRector
        // Changes defined return typehint of method and class.
        //  configure it!
        // Rector\TypeDeclaration\Rector\ClassMethod\AddReturnTypeDeclarationRector::class,
        // AddVoidReturnTypeWhereNoReturnRector
        // Add return type void to function like without any return
        // Rector\TypeDeclaration\Rector\ClassMethod\AddVoidReturnTypeWhereNoReturnRector::class,
        // CompleteVarDocTypePropertyRector
        // Complete property @var annotations or correct the old ones
        // Rector\TypeDeclaration\Rector\Property\CompleteVarDocTypePropertyRector::class,
        // FormerNullableArgumentToScalarTypedRector
        // Change null in argument, that is now not nullable anymore
        // Rector\TypeDeclaration\Rector\MethodCall\FormerNullableArgumentToScalarTypedRector::class,
        // ParamTypeByMethodCallTypeRector
        // Change param type based on passed method call type
        Rector\TypeDeclaration\Rector\ClassMethod\ParamTypeByMethodCallTypeRector::class,
        // ParamTypeByParentCallTypeRector
        // Change param type based on parent param type
        Rector\TypeDeclaration\Rector\ClassMethod\ParamTypeByParentCallTypeRector::class,
        // ParamTypeDeclarationRector
        // Change @param types to type declarations if not a BC-break
        // /!\ We sometime use Traits typing which is not allowed : TODO use interfaces for those traits then apply rule.
        // Rector\TypeDeclaration\Rector\FunctionLike\ParamTypeDeclarationRector::class,
        // ParamTypeFromStrictTypedPropertyRector
        // Add param type from $param set to typed property
        Rector\TypeDeclaration\Rector\Param\ParamTypeFromStrictTypedPropertyRector::class,
        // PropertyTypeDeclarationRector
        // Add @var to properties that are missing it
        // Rector\TypeDeclaration\Rector\Property\PropertyTypeDeclarationRector::class,
        // ReturnNeverTypeRector
        // Add "never" return-type for methods that never return anything
        // Rector\TypeDeclaration\Rector\ClassMethod\ReturnNeverTypeRector::class,
        // ReturnTypeDeclarationRector
        // Change @return types and type from static analysis to type declarations if not a BC-break
        // /!\ We sometime use Traits typing which is not allowed : TODO use interfaces for those traits then apply rule.
        // Rector\TypeDeclaration\Rector\FunctionLike\ReturnTypeDeclarationRector::class,
        // ReturnTypeFromReturnNewRector
        // Add return type to function like with return new
        Rector\TypeDeclaration\Rector\ClassMethod\ReturnTypeFromReturnNewRector::class,
        // ReturnTypeFromStrictTypedCallRector
        // Add return type from strict return type of call
        Rector\TypeDeclaration\Rector\ClassMethod\ReturnTypeFromStrictTypedCallRector::class,
        // ReturnTypeFromStrictTypedPropertyRector
        // Add return method return type based on strict typed property
        Rector\TypeDeclaration\Rector\ClassMethod\ReturnTypeFromStrictTypedPropertyRector::class,
        // TypedPropertyFromStrictConstructorRector
        // Add typed properties based only on strict constructor types
        Rector\TypeDeclaration\Rector\Property\TypedPropertyFromStrictConstructorRector::class,

        // Visibility
        // ChangeConstantVisibilityRector
        // Change visibility of constant from parent class.
        //  configure it!
        // Rector\Visibility\Rector\ClassConst\ChangeConstantVisibilityRector::class,
        // ChangeMethodVisibilityRector
        // Change visibility of method from parent class.
        //  configure it!
        // Rector\Visibility\Rector\ClassMethod\ChangeMethodVisibilityRector::class,
    ];

    // Filled when working on only few rules.
    $debugRules = [
    ];

    if (!empty($debugRules))
    {
        $allRules = $debugRules;
    }

    // get parameters
    $parameters = $containerConfigurator->parameters();

    $parameters->set(
        Option::PHP_VERSION_FEATURES,
        PhpVersion::PHP_81
    );

    // paths to refactor; solid alternative to CLI arguments
    $parameters->set(Option::PATHS, [
        __DIR__.'/src',
        __DIR__.'/tests',
        __DIR__.'/templates',
    ]);

    $services = $containerConfigurator->services();

    foreach ($allRules as $index => $rule)
    {
        $configuration = null;

        if (!is_string($rule))
        {
            $configuration = $rule;
            $rule = $index;
        }

        // Move entities (ORM) to Entity namespace (folder).
        $configurator = $services->set(
            $rule
        );

        if ($configuration)
        {
            $configuration($configurator);
        }
    }

    if (!empty($debugRules))
    {
        return;
    }

    // Symfony
    $containerConfigurator->import(SymfonySetList::SYMFONY_52);

    // Twig
    $containerConfigurator->import(TwigSetList::TWIG_240);

    // Swift
    $containerConfigurator->import(SwiftmailerSetList::SWIFTMAILER_60);

    // Doctrine
    // Customize $containerConfigurator->import(Rector\Doctrine\Set\DoctrineSetList::DOCTRINE_CODE_QUALITY);
    $services->set(ManagerRegistryGetManagerToEntityManagerRector::class);
    $services->set(InitializeDefaultEntityCollectionRector::class);
    $services->set(MakeEntitySetterNullabilityInSyncWithPropertyRector::class);
    $services->set(MakeEntityDateTimePropertyDateTimeInterfaceRector::class);
    $services->set(MoveCurrentDateTimeDefaultInEntityToConstructorRector::class);
    // Remove to avoid issues, @see https://github.com/rectorphp/rector-doctrine/issues/34
    // $services->set(\Rector\Doctrine\Rector\Property\CorrectDefaultTypesOnEntityPropertyRector::class);
    $services->set(ChangeBigIntEntityPropertyToIntTypeRector::class);
    // This rule is messing up variables typing.
    // $services->set(\Rector\Doctrine\Rector\Property\ImproveDoctrineCollectionDocTypeInEntityRector::class);
    // Remove to avoid issues, @see https://github.com/rectorphp/rector-doctrine/issues/34
    // $services->set(\Rector\Doctrine\Rector\Property\RemoveRedundantDefaultPropertyAnnotationValuesRector::class);
    $services->set(RemoveRedundantDefaultClassAnnotationValuesRector::class);
    $services->set(ReplaceStringWithClassConstantRector::class)->call('configure', [[ReplaceStringWithClassConstantRector::REPLACE_STRING_WITH_CLASS_CONSTANT => ValueObjectInliner::inline([new ReplaceStringWithClassConstant('Doctrine\\ORM\\QueryBuilder', 'orderBy', 1, 'Doctrine\\Common\\Collections\\Criteria'), new ReplaceStringWithClassConstant('Doctrine\\ORM\\QueryBuilder', 'addOrderBy', 1, 'Doctrine\\Common\\Collections\\Criteria')])]]);
    $services->set(ServiceGetterToConstructorInjectionRector::class)->call('configure', [[ServiceGetterToConstructorInjectionRector::METHOD_CALL_TO_SERVICES => ValueObjectInliner::inline([new ServiceGetterToConstructorInjection('Doctrine\\Common\\Persistence\\ManagerRegistry', 'getConnection', 'Doctrine\\DBAL\\Connection'), new ServiceGetterToConstructorInjection('Doctrine\\ORM\\EntityManagerInterface', 'getConfiguration', 'Doctrine\\ORM\\Configuration')])]]);
};
