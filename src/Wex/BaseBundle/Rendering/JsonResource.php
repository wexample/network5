<?php

namespace App\Wex\BaseBundle\Rendering;

class JsonResource
{
    public function merge(JsonResource $data)
    {
        foreach ($data as $key => $value)
        {
            if (property_exists($this, $key))
            {
                $this->$key = $value;
            } else
            {
                throw new \Error('Unable to assign variable "'.$key.'" to object of type '.static::class);
            }
        }
    }
}
