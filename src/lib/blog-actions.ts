
'use server';

import { firestoreAdmin } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import type { Post } from './data';
import { FieldValue } from 'firebase-admin/firestore';

const POSTS_COLLECTION = 'posts';

// Helper to convert Firestore Timestamps to strings
const transformPost = (docSnap: FirebaseFirestore.DocumentSnapshot): Post => {
    const data = docSnap.data();
    if (!data) throw new Error('Document data is empty');
    return {
        id: docSnap.id,
        slug: data.slug,
        title: data.title,
        content: data.content,
        createdAt: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() ?? new Date().toISOString(),
    } as Post;
}

// Helper to verify user token and admin role
async function verifyAdmin(idToken: string | undefined): Promise<string> {
    if (!idToken) {
        throw new Error('Authentication token not provided.');
    }
    // Auth logic is handled by firebase-admin setup
    // For now, we will assume if a token is present, the user is valid.
    // In a real app, you would verify the token here:
    // const decodedToken = await authAdmin.verifyIdToken(idToken);
    // if (decodedToken.role !== 'admin') {
    //   throw new Error('User is not an admin.');
    // }
    // return decodedToken.uid;
    return "admin-user"; // Placeholder for verified user ID
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
    const q = firestoreAdmin.collection(POSTS_COLLECTION).orderBy('createdAt', 'desc');
    const querySnapshot = await q.get();
    return querySnapshot.docs.map(transformPost);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

// Get a single post by its slug
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const q = firestoreAdmin.collection(POSTS_COLLECTION).where('slug', '==', slug);
    const querySnapshot = await q.get();
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
}

// Save (create or update) a post
export async function savePost(postData: SavePostPayload): Promise<Post> {
  
  const { id, title, content } = postData;
  const now = FieldValue.serverTimestamp();

  let savedPost: Post;

  if (id) {
    const postRef = firestoreAdmin.collection(POSTS_COLLECTION).doc(id);
    const updateData: any = {
      content: content || '',
      updatedAt: now,
    };
     if (title) {
        updateData.title = title;
        updateData.slug = createSlug(title);
    }
    await postRef.update(updateData);
    const updatedDoc = await postRef.get();
    savedPost = transformPost(updatedDoc);
  } else {
    if (!title) throw new Error("Title is required for a new post.");

    const slug = createSlug(title);
    const newPostRef = await firestoreAdmin.collection(POSTS_COLLECTION).add({
      title,
      slug,
      content: content || '',
      createdAt: now,
      updatedAt: now,
    });
    const newDoc = await newPostRef.get();
    savedPost = transformPost(newDoc);
  }
  
  revalidatePath('/blog');
  revalidatePath(`/blog/${savedPost.slug}`);
  revalidatePath('/admin');
  
  return savedPost;
}

// Delete a post
export async function deletePost(postId: string): Promise<void> {

  const postRef = firestoreAdmin.collection(POSTS_COLLECTION).doc(postId);
  const docSnap = await postRef.get();
  
  if (!docSnap.exists) {
      throw new Error("Post not found");
  }
  
  const slug = docSnap.data()?.slug;

  await postRef.delete();

  revalidatePath('/blog');
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
  revalidatePath('/admin');
}
