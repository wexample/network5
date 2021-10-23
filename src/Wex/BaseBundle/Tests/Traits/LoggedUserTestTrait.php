<?php

namespace App\Wex\BaseBundle\Tests\Traits;

trait LoggedUserTestTrait
{
    abstract public function getUserLoginRoute(): string;

    abstract public function getUserLogoutRoute(): string;

    public function getUserLoginPath(): string
    {
        return $this->url($this->getUserLoginRoute());
    }

    public function getUserLogoutPath(): string
    {
        return $this->url($this->getUserLogoutRoute());
    }
}
