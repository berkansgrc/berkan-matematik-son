
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { courseData as staticCourseData, grades, CourseData, GradeSlug, Subject } from './data';
import { revalidatePath } from 'next/cache';

const COURSE_COLLECTION = 'courseData';
const SINGLE_DOCUMENT_ID = 'allGrades';

// Helper to create an empty structure for all grades
function getEmptyCourseData(): CourseData {
    const emptyData: any = {};
    grades.forEach(g => {
        emptyData[g.slug] = {
            ...staticCourseData[g.slug], // Keep name and description
            subjects: [], // Subjects will hold the resources
        };
    });
    return emptyData;
}

// This action is now used to update the subjects for a specific grade
// and revalidate the cache.
export async function updateCourseData(grade: GradeSlug, subjects: Subject[]) {
    try {
        const docRef = doc(db, COURSE_COLLECTION, SINGLE_DOCUMENT_ID);
        await updateDoc(docRef, { [`${grade}.subjects`]: subjects });

        // Revalidate the path for the specific grade page and the homepage
        revalidatePath(`/${grade}`);
        revalidatePath('/'); // Revalidate home if it shows featured content

    } catch (error) {
        console.error("Error updating course data:", error);
        throw new Error("Ders verisi güncellenirken bir hata oluştu.");
    }
}

// This action handles deletion and also revalidates the cache.
export async function deleteCourseItem(grade: GradeSlug, updatedSubjects: Subject[]) {
    try {
        const docRef = doc(db, COURSE_COLLECTION, SINGLE_DOCUMENT_ID);
        await updateDoc(docRef, { [`${grade}.subjects`]: updatedSubjects });
        
        // Revalidate the path for the specific grade page and the homepage
        revalidatePath(`/${grade}`);
        revalidatePath('/'); // Revalidate home if it shows featured content

    } catch (error) {
        console.error("Error deleting course item:", error);
        throw new Error("Silme işlemi sırasında bir hata oluştu.");
    }
}

// Fetches all course data from the single document in Firestore.
// This function runs on the server and is readable by everyone.
export async function getCourseData(): Promise<CourseData> {
    try {
        const docRef = doc(db, COURSE_COLLECTION, SINGLE_DOCUMENT_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const firestoreData = docSnap.data() as CourseData;
            const mergedData: any = {};
            
            // Ensure all grades from static data are present and have static info
            for (const grade of grades) {
                const slug = grade.slug;
                mergedData[slug] = {
                    name: grade.name,
                    description: grade.description,
                    subjects: firestoreData[slug]?.subjects ?? [], // Use subjects from Firestore or empty array
                };
            }
            return mergedData;

        } else {
            console.log("Course data document not found. Initializing with empty structure.");
            // If the document doesn't exist, create it with an empty structure
            const emptyData = getEmptyCourseData();
            await setDoc(docRef, emptyData);
            return emptyData;
        }
    } catch(error) {
        console.error("Error fetching course data:", error);
        // On error, return the default structure to avoid breaking the site.
        // The data on the site might be stale, but it won't crash.
        return staticCourseData;
    }
}
