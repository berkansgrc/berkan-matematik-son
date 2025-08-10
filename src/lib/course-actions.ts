
'use server';

import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, updateDoc, setDoc, deleteField, arrayUnion, arrayRemove, writeBatch } from 'firebase/firestore';
import { courseData as staticCourseData, grades, GradeSlug, GradeData, Resource, ResourceCategory } from './data';

const COURSE_COLLECTION = 'courseData';
const SINGLE_DOCUMENT_ID = 'allGrades';

// Helper to ensure data exists in Firestore, seeding if necessary.
async function ensureDataInitialized(): Promise<void> {
    const docRef = doc(db, COURSE_COLLECTION, SINGLE_DOCUMENT_ID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        console.log("No course data found in Firestore, seeding from static data...");
        try {
            await setDoc(docRef, staticCourseData, { merge: true });
            console.log("Successfully seeded course data to Firestore.");
        } catch (error) {
            console.error("Error seeding data to Firestore: ", error);
            throw new Error("Failed to initialize course data.");
        }
    }
}

// Fetches all course data from the single document in Firestore.
export async function getCourseData(): Promise<GradeData> {
    await ensureDataInitialized();
    const docRef = doc(db, COURSE_COLLECTION, SINGLE_DOCUMENT_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        // We need to transform the data to include IDs for each resource
        const data = docSnap.data() as Record<GradeSlug, Omit<GradeData, 'name' | 'description'>>;
        const transformedData: any = {};

        for (const gradeSlug of Object.keys(data)) {
            transformedData[gradeSlug] = {
                 ...staticCourseData[gradeSlug as GradeSlug], // Keep static name/desc
                ...data[gradeSlug as GradeSlug],
            };
        }
        return transformedData;
    } else {
        console.error("Could not fetch course data after attempting to initialize.");
        throw new Error("Course data not found in Firestore.");
    }
}


// Adds a new resource to a specific grade and category.
export async function addResource(grade: GradeSlug, category: ResourceCategory, resource: Omit<Resource, 'id'>): Promise<void> {
    if (!grade || !category || !resource) {
        throw new Error("Invalid arguments for adding a resource.");
    }
    const docRef = doc(db, COURSE_COLLECTION, SINGLE_DOCUMENT_ID);
    const newId = doc(collection(db, '_')).id; // Generate a unique ID
    const resourceWithId: Resource = { ...resource, id: newId };
    
    // The key for the field to update, e.g., '5-sinif.videos'
    const fieldKey = `${grade}.${category}`;

    try {
        await updateDoc(docRef, {
            [fieldKey]: arrayUnion(resourceWithId)
        });
    } catch (error) {
        console.error("Error adding resource: ", error);
        throw new Error("Failed to add resource.");
    }
}

// Updates an existing resource.
export async function updateResource(grade: GradeSlug, category: ResourceCategory, resourceId: string, updatedFields: Partial<Resource>): Promise<void> {
    if (!grade || !category || !resourceId) {
        throw new Error("Invalid arguments for updating a resource.");
    }
    const docRef = doc(db, COURSE_COLLECTION, SINGLE_DOCUMENT_ID);
    
    try {
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) throw new Error("Course data document not found.");

        const data = docSnap.data();
        const resources = data[grade]?.[category] as Resource[] || [];
        
        const resourceIndex = resources.findIndex(r => r.id === resourceId);
        if (resourceIndex === -1) throw new Error("Resource not found to update.");

        // Create a new array with the updated resource
        const newResources = [...resources];
        newResources[resourceIndex] = { ...newResources[resourceIndex], ...updatedFields };

        // Update the entire array field
        const fieldKey = `${grade}.${category}`;
        await updateDoc(docRef, { [fieldKey]: newResources });

    } catch (error) {
        console.error("Error updating resource: ", error);
        throw new Error("Failed to update resource.");
    }
}


// Deletes a resource from a specific grade and category.
export async function deleteResource(grade: GradeSlug, category: ResourceCategory, resourceId: string): Promise<void> {
    if (!grade || !category || !resourceId) {
        throw new Error("Invalid arguments for deleting a resource.");
    }
    const docRef = doc(db, COURSE_COLLECTION, SINGLE_DOCUMENT_ID);

    try {
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) throw new Error("Course data document not found.");
        
        const data = docSnap.data();
        const resources = data[grade]?.[category] as Resource[] || [];
        const resourceToDelete = resources.find(r => r.id === resourceId);

        if (!resourceToDelete) {
            console.warn("Resource to delete not found, maybe already deleted.");
            return;
        }

        const fieldKey = `${grade}.${category}`;
        await updateDoc(docRef, {
            [fieldKey]: arrayRemove(resourceToDelete)
        });

    } catch (error) {
        console.error("Error deleting resource: ", error);
        throw new Error("Failed to delete resource.");
    }
}
