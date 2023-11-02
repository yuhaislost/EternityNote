"use client";
import {Button} from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Heading = function()
{
    return(
        <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
                Internalise, Think & Create. Welcome to <span className="underline">Eternity</span>
            </h1>
            <h3 className="text-base sm:text-xl md:text-2xl font-medium">
                Eternity a digital workspace where<br/>
                a business is run with one button.
            </h3>
            <Button>
                Dive into Eternity
                <ArrowRight className='h-4 w-4 ml-4'/>
            </Button>
        </div>
    )
}

export default Heading;