'use client';

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Spinner } from "@/components/spinner";
import { Search, Trash, Undo } from "lucide-react";
import ConfirmModal from "@/components/modals/confirm-modal";

const Trashbox = function()
{

    const router = useRouter();
    const params = useParams();
    const documents = useQuery(api.documents.getTrash);
    const restore = useMutation(api.documents.restore);
    const remove = useMutation(api.documents.remove);

    const [search, setSearch] = useState("");
    const filteredDocuments = documents?.filter((doc) => {
        return document.title.toLowerCase().includes(search.toLowerCase());
    });

    const onClick = function(documentId: string)
    {
        router.push(`/dashboard/${documentId}`);
    }

    const onRestore = function(event: React.MouseEvent<HTMLDivElement, MouseEvent>, documentId: Id<"documents">)
    {
        event.stopPropagation();
        const promise = restore({id: documentId});


        toast.promise(promise, {
            "loading": "Attempting to restore note...",
            "success": "Restored a note!",
            "error": "Failed to restore a note."
        });
    }

    const onRemove = function(documentId: Id<"documents">)
    {
        const promise = remove({id: documentId});


        toast.promise(promise, {
            "loading": "Attempting to delete note...",
            "success": "Deleted a note!",
            "error": "Failed to delete a note."
        });


        if(params.documentId === documentId)
        {
            router.push(`/dashboard`);
        }
    }

    if (documents === undefined)
    {
        return (
            <div className="h-full flex items-center justify-center p-4">
                <Spinner size={'lg'}/>
            </div>
        );
    }

    return (
        <div className="text-sm">
            <div className="flex items-center gap-x-1 p-2 ">
                <Search className="h-4 w-4"/>
                <Input value={search} onChange={(e) => setSearch(e.target.value)} className="h-7 px-2 focus-visible:ring-transparent bg-secondary" placeholder="Search by page title"/>
            </div>
            <div className="mt-2 px-2 pb-1">
                <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">No notes found.</p>
                {filteredDocuments?.map((doc : any) => (
                    <div key={doc._id} role="button" onClick={() => onClick(doc._id)} className="text-sm rounded-sm w-full hover:bg-primary/5 flex items-center text-primary justify-between">
                        <span className="truncate">{doc.title}</span>
                        <div className="flex items-center">
                            <div onClick={(e) => onRestore(e, doc._id)} role="button" className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600">
                                <Undo className="h-4 w-4 text-muted-foreground"/>
                            </div>
                            <ConfirmModal onConfirm={()=>onRemove(doc._id)}>
                                <div role="button" className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600">
                                    <Trash className="h-4 w-4 text-muted-foreground"/>
                                </div>
                            </ConfirmModal>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Trashbox;