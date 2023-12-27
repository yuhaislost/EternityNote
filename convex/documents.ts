import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { Doc, Id } from './_generated/dataModel';
import * as c from 'typescript-collections';

// Attempting abstraction
// // const documentChildrenBFS = async function(ctx: any, identity: UserIdentity,  documentId: Id<"documents">, action: any)
// // {
// //     let queue = new c.Queue<Id<"documents"> | undefined>;
// //     queue.add(documentId);

// //     while (!queue.isEmpty())
// //     {
// //         const parentId = queue.dequeue();
// //         const children = await ctx.db.query('documents').withIndex('by_user_parent', (q : any) => q.eq("userId", identity.subject).eq("parentDocument", parentId)).collect();

// //         for (let i = 0; i < children.length; i++)
// //         {
// //             queue.add(children.at(i)?._id);
// //             await action(children.at(i)?._id);
// //         }
// //     }
// }

export const archive = mutation({
    args:{
        id : v.id("documents"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity)
        {
            throw new Error("Not authenticated");
        }

        const document = await ctx.db.get(args.id);

        if (!document)
        {
            throw new Error("Document is not found");

        } else if (document.userId != identity.subject)
        {
            throw new Error("Not authorised to delete this note.");
        }

        // Unviable solution during production or scaling as in this case with millions of people archiving would cause a stack overflow
        // const recusriveArchive = async function(documentId: Id<"documents">)
        // {
        //     const children = await ctx.db.query("documents").withIndex("by_user_parent", (q)=>(
        //         q.eq("userId", identity.subject)
        //         .eq("parentDocument", documentId)
        //     )).collect();


        //     if (!children)
        //     {
        //         return;
        //     }



        //     for (const child of children)
        //     {
        //         await ctx.db.patch(child._id, {isArchived: true});
        //         await recusriveArchive(child._id)
        //     }
        // }

        //Arhiving documents which are nested within each other through Breath-First Search
        const bfsArchive = async function(documentId: Id<"documents">)
        {
            let queue = new c.Queue<Id<"documents"> | undefined>;
            queue.add(documentId);

            while (!queue.isEmpty())
            {
                const parentId = queue.dequeue();
                const children = await ctx.db.query('documents').withIndex('by_user_parent', (q) => q.eq("userId", identity.subject).eq("parentDocument", parentId)).collect();

                for (let i = 0; i < children.length; i++)
                {
                    queue.add(children.at(i)?._id);
                    await ctx.db.patch(children.at(i)?._id!, {isArchived: true});
                }
            }

        }

        const modifiedDocument = await ctx.db.patch(args.id, {
            isArchived: true,
        });

        bfsArchive(args.id);

        return modifiedDocument;

    }
});

export const getSidebar = query({
    args: {
        parentDocument: v.optional(v.id("documents"))
    },
    handler: async (ctx, args) =>{
        const identity = await ctx.auth.getUserIdentity();

        if(!identity)
        {
            throw new Error("Not Authenticated");
        }

        const userId = identity.subject;

        const documents = await ctx.db.query("documents")
        .withIndex("by_user_parent", (q) =>q.eq("userId", userId).eq("parentDocument", args.parentDocument))
        .filter((q) => q.eq(q.field("isArchived"), false))
        .order("desc")
        .collect();

        return documents;

    }
});

export const create = mutation({
    args: {
        title: v.string(),
        parentDcoument: v.optional(v.id("documents"))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        console.log(identity);
        if (!identity)
        {
            throw new Error("Not Authenticated");
        }

        const userId = identity.subject;

        const document = await ctx.db.insert("documents", {
            title: args.title,
            parentDocument: args.parentDcoument,
            userId: userId,
            isArchived: false,
            isPublished: false
        });

        return document;
    }
});

export const getTrash = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity)
        {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const documents = await ctx.db.query("documents").withIndex("by_user", (q) => q.eq("userId", userId)).filter((q)=>q.eq(q.field("isArchived"),true)).order("desc").collect();

        return documents;
    }
});

export const restore = mutation({
    args:{
        id: v.id("documents")
    },
    handler: async(ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity)
        {
            throw new Error("Not authenticated");
        }

        let document: Doc<any> = await ctx.db.get(args.id);

        if (!document)
        {
            throw new Error("The note does not exist.");
        }

        if (document.userId != identity.subject)
        {
            throw new Error("Unauthorised");
        }

        const options: Partial<Doc<"documents">> = {
            isArchived: false,
        };

        const restoreBFS = async function (documentId: Id<'documents'>)
        {
            let queue = new c.Queue<Id<'documents'> | undefined>();
            queue.add(documentId);

            while (!queue.isEmpty())
            {
                const child = queue.dequeue();
                const children = await ctx.db.query("documents").withIndex('by_user_parent', (q) => q.eq("userId", identity.subject).eq("parentDocument", child)).collect();

                for (let i = 0; i < children.length; i++)
                {
                    queue.add(children.at(i)?._id);
                    await ctx.db.patch(children.at(i)?._id!, {isArchived: false});
                }
            }
        }

        if (document.parentDocument)
        {
            const parent = await ctx.db.get(document.parentDocument);
            if (parent?.isArchived)
            {
                options.parentDocument = undefined;
            }
        }

        document = await ctx.db.patch(args.id, options);

        restoreBFS(args.id);

        return document;

    }
});

export const remove = mutation({
    args:{
        id: v.id("documents")
    },
    handler: async (ctx, args) =>{
        const identity = await ctx.auth.getUserIdentity();

        if (!identity)
        {
            throw new Error("Not authenticated");
        }

        const document = await ctx.db.get(args.id);

        if (!document)
        {
            throw new Error("Note not found!");
        }

        if (document.userId !== identity.subject)
        {
            throw new Error("Unauthorised access.");
        }

        const deleted = await ctx.db.delete(document._id);

        return deleted;
    }
});

export const getSearch = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity)
        {
            throw new Error("Not authenticated");
        }

        const documents = await ctx.db.query("documents").withIndex('by_user', (q) => q.eq("userId", identity.subject))
        .filter((q) => q.eq(q.field('isArchived'), false))
        .order('desc')
        .collect();

        return documents;
    }
})

export const getById = query({
    args: {
        documentId: v.id("documents")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        const document = await ctx.db.get(args.documentId);

        if (!document)
        {
            throw new Error("Document does not exist");
        }

        if (document.isPublished && !document.isArchived)
        {
            return document;
        }

        if (!identity)
        {
            throw new Error("Not authenticated");
        }

        if (document.userId !== identity.subject)
        {
            throw new Error("Unauthorised");
        }

        return document;
    }    
})

export const update = mutation({
    args: {
        id: v.id("documents"),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
        coverImage: v.optional(v.string()),
        icon: v.optional(v.string()),
        isPublished: v.optional(v.boolean())
    },
    handler: async(ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity)
        {
            throw new Error("Not authenticated");
        }

        // Id is seprated as id is never required to update, hwoever id is extracted to find the document
        const { id, ...rest } = args;

        const document = await ctx.db.get(id);

        if (!document)
        {
            throw new Error("Document does not exist");
        }

        if (document.userId !== identity.subject)
        {
            throw new Error("Unauthorised");
        }

        const newDocument = await ctx.db.patch(id, {...rest});

        return newDocument;

    }
})

export const removeIcon = mutation({
    args: {id: v.id("documents")},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity)
        {
            throw new Error("Unauthenticated");
        }

        const userId = identity.subject;

        const existingDocument = await ctx.db.get(args.id);

        if (!existingDocument)
        {
            throw new Error("Not found");
        }

        if (existingDocument.userId != userId)
        {
            throw new Error("Unauthroized");
        }

        const document = await ctx.db.patch(args.id, {
            icon: undefined
        });

        return document;
    }
})

export const removeCoverImage = mutation({
    args: {id: v.id("documents")},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity)
        {
            throw new Error("Unauthorized");
        }

        const document = await ctx.db.get(args.id);

        if (!document)
        {
            throw new Error("Not found!");
        }

        if (document.userId != identity.subject)
        {
            throw new Error("Unauthorized access");
        }

        const newDocument = await ctx.db.patch(args.id, {
            coverImage: undefined
        });

        return newDocument;
    }
})