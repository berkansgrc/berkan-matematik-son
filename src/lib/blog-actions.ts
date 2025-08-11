
'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { Post } from './data';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { withAuth } from '@genkit-ai/next';

const POSTS_COLLECTION = 'posts';

// Helper to convert Firestore Timestamps to strings
const transformPost = (docSnap: any): Post => {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() ?? new Date().toISOString(),
    } as Post;
}

// Function to generate a URL-friendly slug from a title
const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};


// Get all posts, ordered by creation date
export async function getPosts(): Promise<Post[]> {
  try {
    const q = query(collection(db, POSTS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(transformPost);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

// Get a single post by its slug
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const q = query(collection(db, POSTS_COLLECTION), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    return transformPost(querySnapshot.docs[0]);
  } catch (error) {
     console.error("Error fetching post by slug:", error);
    return null;
  }
}

// Define Zod schemas for input validation
const PostSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  thumbnailUrl: z.string().url().or(z.literal('')).optional(),
});

const PostIdSchema = z.string().min(1, 'Post ID is required');


// Save (create or update) a post
export const savePost = ai.defineFlow(
  {
    name: 'savePost',
    inputSchema: PostSchema,
    outputSchema: z.custom<Post>(),
  },
  withAuth(async (postData, context) => {
    const userDocRef = doc(db, 'users', context.auth.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists() || userDoc.data().role !== 'admin') {
      throw new Error('Permission denied: Only admins can save posts.');
    }

    const { id, title, content, thumbnailUrl } = postData;
    const now = serverTimestamp();

    let savedPost: Post;

    if (id) {
      // Update existing post
      const postRef = doc(db, POSTS_COLLECTION, id);
      const updateData: any = { content, thumbnailUrl: thumbnailUrl || null, updatedAt: now };
      if (title) {
          updateData.title = title;
          updateData.slug = createSlug(title);
      }
      await updateDoc(postRef, updateData);
      
      const updatedDoc = await getDoc(postRef);
      savedPost = transformPost(updatedDoc);
      revalidatePath('/blog');
      revalidatePath(`/blog/${savedPost.slug}`);
      revalidatePath('/admin');
    } else {
      // Create new post
      if (!title) throw new Error("Title is required for a new post.");

      const slug = createSlug(title);
      const newPostRef = await addDoc(collection(db, POSTS_COLLECTION), {
        title,
        slug,
        content: content || '',
        thumbnailUrl: thumbnailUrl || null,
        createdAt: now,
        updatedAt: now,
      });
      const newDoc = await getDoc(newPostRef);
      savedPost = transformPost(newDoc);
      revalidatePath('/blog');
      revalidatePath('/admin');
    }
    
    return savedPost;
  })
);

// Delete a post
export const deletePost = ai.defineFlow(
  {
    name: 'deletePost',
    inputSchema: PostIdSchema,
    outputSchema: z.void(),
  },
  withAuth(async (postId, context) => {
      const userDocRef = doc(db, 'users', context.auth.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists() || userDoc.data().role !== 'admin') {
          throw new Error('Permission denied: Only admins can delete posts.');
      }

      const postRef = doc(db, POSTS_COLLECTION, postId);
      const docSnap = await getDoc(postRef);
      if (!docSnap.exists()) {
          throw new Error("Post not found");
      }
      
      const slug = docSnap.data().slug;

      await deleteDoc(postRef);

      revalidatePath('/blog');
      revalidatePath(`/blog/${slug}`);
      revalidatePath('/admin');
  })
);
