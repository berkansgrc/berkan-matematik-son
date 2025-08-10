
'use server';

import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, updateDoc, setDoc, deleteField, arrayUnion, arrayRemove, writeBatch } from 'firebase/firestore';
import { courseData as staticCourseData, grades, GradeSlug, GradeData, Resource, ResourceCategory } from './data';

const COURSE_COLLECTION = 'courseData';
const SINGLE_DOCUMENT_ID = 'allGrades';

// Helper to create an empty structure for all grades
function getEmptyCourseData(): CourseData {
    const emptyData: any = {};
    grades.forEach(g => {
        emptyData[g.slug] = {
            ...staticCourseData[g.slug], // Keep name and description
            videos: [],
            documents: [],
            applications: [],
        };
    });
    return emptyData;
}


// Fetches all course data from the single document in Firestore.
export async function getCourseData(): Promise<CourseData> {
    const docRef = doc(db, COURSE_COLLECTION, SINGLE_DOCUMENT_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data() as Record<GradeSlug, Omit<GradeData, 'name' | 'description'>>;
        const transformedData: any = {};

        for (const gradeSlug of Object.keys(staticCourseData)) {
            const slug = gradeSlug as GradeSlug;
            transformedData[slug] = {
                 ...staticCourseData[slug], // Keep static name/desc
                 ...(data[slug] || {}), // Merge with data from firestore, or empty object if not present
            };
        }
        return transformedData;
    } else {
        console.warn("Course data document not found in Firestore. Returning empty data structure. Admin should initialize data.");
        // If the document doesn't exist, return a structured object with empty resource arrays
        // This prevents errors on the frontend which expects the grade keys to exist.
        return getEmptyCourseData();
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
    
    const fieldKey = `${grade}.${category}`;

    try {
        // Use set with merge:true to create the document if it doesn't exist.
        // This ensures the first resource can be added smoothly.
        await setDoc(docRef, {
            [grade]: {
                [category]: arrayUnion(resourceWithId)
            }
        }, { merge: true });

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
        const gradeData = data[grade];
        if (!gradeData) throw new Error(`Grade '${grade}' not found.`);
        
        const resources = gradeData[category] as Resource[] | undefined;
        if (!resources) throw new Error(`Category '${category}' not found in grade '${grade}'.`);

        const resourceIndex = resources.findIndex(r => r.id === resourceId);
        if (resourceIndex === -1) throw new Error("Resource not found to update.");

        const newResources = [...resources];
        newResources[resourceIndex] = { ...newResources[resourceIndex], ...updatedFields, id: resourceId };

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
        const gradeData = data[grade];
        if (!gradeData) throw new Error(`Grade '${grade}' not found.`);

        const resources = gradeData[category] as Resource[] | undefined;
        if (!resources) {
             console.warn(`Category '${category}' not found in grade '${grade}', nothing to delete.`);
             return;
        }
        
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
