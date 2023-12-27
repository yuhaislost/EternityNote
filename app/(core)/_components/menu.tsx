'use client';

import { Id } from "@/convex/_generated/dataModel";
import { api } from '@/convex/_generated/api';
import { useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";


import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuProps{
    documentId: Id<"documents">;
};

const Menu = function({ documentId }: MenuProps)
{
    const router = useRouter();
    const { user } = useUser();

    const archive = useMutation(api.documents.archive);

    const onArchive = function()
    {
        const promise = archive({id: documentId});

        toast.promise(promise, {
            'loading': 'Moving to trash...',
            'success': 'Note moved to trash!',
            'error': 'Failed to move note to trash.'
        });
    }

    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size='sm' variant='ghost'>
                    <MoreHorizontal className="h-4 w-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60" align="end" alignOffset={8} forceMount>
                <DropdownMenuItem onClick={onArchive}>
                    <Trash className="h-4 w-4 mr-2"/>
                    Delete
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <div className="text-xs text-muted-foreground p-2">
                    Last edited by: {user?.fullName}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

Menu.Skeleton = function MenuSkeleton()
{
    return <Skeleton className="h-10 w-10"/>
}

export default Menu;