'use client';

import Link from 'next/link';

import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";

import { Logo } from "./logo";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from '@/components/ui/button';

import { useConvexAuth } from 'convex/react';
import { SignInButton, UserButton } from '@clerk/clerk-react';
import { Spinner } from "@/components/spinner";

export const Navbar = function()
{
    const { isAuthenticated, isLoading } = useConvexAuth();
    const scrolled = useScrollTop();

    return(
        <div className={cn("z-50 bg-background dark:bg-[#1F1F1F] fixed top-0 flex items-center w-full p-6", scrolled && 'border-b shadow-sm')}>
            <Logo/>
            <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2">
                {isLoading && (<Spinner/>)}
                {!isAuthenticated && !isLoading && (
                    <>
                        <SignInButton mode="modal">
                            <Button variant={'ghost'} size={'sm'}>Log In</Button>
                        </SignInButton>
                        <SignInButton mode="modal">
                            <Button  className="hidden md:block" size={'sm'}>Hop into Eternity</Button>
                        </SignInButton>
                    </>
                )}
                {isAuthenticated && !isLoading && (
                    <>
                        <Button size="sm" asChild>
                            <Link href="/documents">
                                Enter Eternity
                            </Link>
                        </Button>
                    </>
                )}
                <UserButton/>
                <ModeToggle/>
            </div>
        </div>
    )
}