"use client";

import { BlockNoteEditor, PartialBlock } from '@blocknote/core';
import { useBlockNote, BlockNoteView } from '@blocknote/react';
import '@blocknote/core/style.css';
import { useTheme } from 'next-themes';
import { useEdgeStore } from '@/lib/edgestore';


interface EditorProps{
    onChange: (value: string) => void;
    initialContent?: string;
    editable?: boolean;
};

const Editor = function({ onChange, initialContent, editable} : EditorProps)
{

    
    const { edgestore } = useEdgeStore(); 

    const handleFileUpload = async function(file : File)
    {
        const res = await edgestore.publicFiles.upload({file: file});

        return res.url;
    }
    

    const { resolvedTheme } = useTheme();
    const editor: BlockNoteEditor = useBlockNote({
        editable: editable,
        initialContent: initialContent ? JSON.parse(initialContent) as PartialBlock[]: undefined,
        onEditorContentChange: (editor) => {
            onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
        },
        uploadFile: handleFileUpload
    });


    return (
        <div>
            <BlockNoteView editor={editor} theme={resolvedTheme === 'dark' ? 'dark' : 'light'}/>
        </div>
    );
}

export default Editor;