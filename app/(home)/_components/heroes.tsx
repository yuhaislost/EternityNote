import Image from 'next/image';

export const Heroes = function()
{
    return(
        <div className='flex flex-col items-center justify-center max-w-5xl'>
            <div className='flex items-center'>
                <div className='relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px]'>
                    <Image src={'https://illustrations.popsy.co/white/studying.svg'} className='object-contain dark:hidden' fill alt='think'/>
                    <Image src={'/v_study_mdark.svg'} className='object-contain hidden dark:block' fill alt='think'/>
                </div>
                <div className='relative h-[400px] w-[400px] hidden md:block'>
                    <Image src={'https://illustrations.popsy.co/white/product-launch.svg'} className='object-contain dark:hidden' fill alt='productlaunch'/>
                    <Image src={'/v_productlaunch_mdark.svg'} className='object-contain hidden dark:block' fill alt='productlaunch'/>
                </div>
            </div>
        </div>
    )
}