
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { courseData as staticCourseData, grades, CourseData } from './data';

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
        return getEmptyCourseData();
    }
}
