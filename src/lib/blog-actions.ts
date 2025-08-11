
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

interface SavePostPayload {
  id?: string;
  title: string;
  content?: string;
  thumbnailUrl?: string;
}

// Save (create or update) a post
export async function savePost(postData: SavePostPayload): Promise<Post> {
  // Security should be enforced by Firestore rules.
  const { id, title, content, thumbnailUrl } = postData;
  const now = serverTimestamp();

  let savedPost: Post;

  if (id) {
    // Update existing post
    const postRef = doc(db, POSTS_COLLECTION, id);
    const updateData: any = { 
        content, 
        updatedAt: now,
        thumbnailUrl: thumbnailUrl ?? null,
    };
    if (title) {
        updateData.title = title;
        updateData.slug = createSlug(title);
    }
    await updateDoc(postRef, updateData);
    
    const updatedDoc = await getDoc(postRef);
    savedPost = transformPost(updatedDoc);
    
  } else {
    // Create new post
    if (!title) throw new Error("Title is required for a new post.");

    const slug = createSlug(title);
    const newPostRef = await addDoc(collection(db, POSTS_COLLECTION), {
      title,
      slug,
      content: content || '',
      thumbnailUrl: thumbnailUrl ?? null,
      createdAt: now,
      updatedAt: now,
    });
    const newDoc = await getDoc(newPostRef);
    savedPost = transformPost(newDoc);
  }
  
  revalidatePath('/blog');
  revalidatePath(`/blog/${savedPost.slug}`);
  revalidatePath('/admin');
  
  return savedPost;
}

// Delete a post
export async function deletePost(postId: string): Promise<void> {
  // Security should be enforced by Firestore rules.
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
}
