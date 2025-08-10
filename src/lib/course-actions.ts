
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { courseData as staticCourseData, grades, GradeSlug, GradeData } from './data';

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
// This function runs on the server and is readable by everyone.
export async function getCourseData(): Promise<CourseData> {
    try {
        const docRef = doc(db, COURSE_COLLECTION, SINGLE_DOCUMENT_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as Record<GradeSlug, Omit<GradeData, 'name' | 'description'>>;
            const transformedData: any = {};

            for (const gradeSlug of Object.keys(staticCourseData)) {
                const slug = gradeSlug as GradeSlug;
                transformedData[slug] = {
                    ...staticCourseData[slug], // Keep static name/desc
                    ...(data[slug] || { videos: [], documents: [], applications: [] }), // Merge with data from firestore
                };
            }
            return transformedData;
        } else {
            console.log("Course data document not found. Returning empty structure. Admin can add the first resource to create it.");
            // If the document doesn't exist, return a structured object with empty resource arrays
            return getEmptyCourseData();
        }
    } catch(error) {
        console.error("Error fetching course data:", error);
        // On permission errors, return empty data to allow the page to render.
        return getEmptyCourseData();
    }
}
