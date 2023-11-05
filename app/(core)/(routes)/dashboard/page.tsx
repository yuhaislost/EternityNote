'use client';

import Image from 'next/image';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';

const DashboardPage = function()
{
    const { user } = useUser();
    const create = useMutation(api.documents.create);

    const onCreate = function ()
    {
        const promise = create({ title: "Untitled" });

        toast.promise(promise, {
            loading: "Creating a new note...",
            success: "New note created!",
            error: "Failed to create a new note."
        })

    }

    return(
        <div className='h-full flex flex-col items-center justify-center space-y-4'>
            <Image src={'https://illustrations.popsy.co/white/genius.svg'} height={300} width={300} alt='Start work' className='dark:hidden'/>
            <h2 className='text-lg font-medium'>Welcome to {user?.firstName}&apos;s Eternity Workspace</h2>
            <Button onClick={onCreate}>
                <PlusCircle className='h-4 w-4 mr-2'/>
                Create a workspace
            </Button>
        </div>
    )
}

export default DashboardPage;