'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

const Error = function()
{
    return(
        <div className='h-full flex flex-col items-center justify-center gap-5'>
            <Image src={'/error_light.svg'} height={300} width={300} alt='Error' className='dark:hidden'/>
            <Image src={'/error_dark.png'} height={300} width={300} alt='Error' className='hidden dark:block'/>
            <h2 className='text-xl font-medium textfloat'>Something went wrong!</h2>
            <Button className='mt-3'asChild>
                <Link href={'/dashboard'}>
                    Go back
                </Link>
            </Button>
        </div>
    )
}

export default Error;