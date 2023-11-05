import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { Doc, Id } from './_generated/dataModel';
import * as c from 'typescript-collections';

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