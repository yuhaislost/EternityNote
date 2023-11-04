"use client";
import {Button} from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

import { useConvexAuth } from 'convex/react';
import { SignInButton } from '@clerk/clerk-react';

import Link from 'next/link';
import { routes } from '@/lib/constants';


const Heading = function()
{
    const { isAuthenticated, isLoading} = useConvexAuth();

    return(
        <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
                Internalise, Think & Create. Welcome to <span className="underline">Eternity</span>
            </h1>
            <h3 className="text-base sm:text-xl md:text-2xl font-medium">
                Eternity a digital workspace where<br/>
                a business is run with one button.
            </h3>
            {isAuthenticated && !isLoading && (
                <Button className='group' asChild>
                    <Link href={routes.Dashboard}>
                        Dive into Eternity
                        <ArrowRight className='h-4 w-4 ml-4 group-hover:translate-x-1 transition'/>
                    </Link>
                </Button>
            )}
            {!isAuthenticated && !isLoading &&(
                <>
                    <SignInButton afterSignInUrl={routes.Dashboard}>
                        <Button className='group'>
                            Dive into Eternity
                            <ArrowRight className='h-4 w-4 ml-4 group-hover:translate-x-1 transition'/>
                        </Button>
                    </SignInButton>
                </>
            )}
        </div>
    )
}

export default Heading;