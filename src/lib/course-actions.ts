
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { courseData as staticCourseData, grades, GradeSlug, Quiz, CourseData, Resource } from './data';
import { revalidatePath } from 'next/cache';

const COURSE_COLLECTION = 'courseData';
const SINGLE_DOCUMENT_ID = 'allGrades';
const QUIZZES_COLLECTION = 'quizzes';

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
            // The document contains the entire CourseData object.
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


export async function saveQuizAndAddAsResource(
  quiz: Quiz,
  gradeSlug: GradeSlug,
  subjectId: string,
) {
  if (!quiz || !gradeSlug || !subjectId) {
    throw new Error('Eksik parametre: quiz, gradeSlug, and subjectId gereklidir.');
  }

  try {
    // 1. Save the quiz to its own collection for easy retrieval
    const quizDocRef = doc(db, QUIZZES_COLLECTION, quiz.id);
    await setDoc(quizDocRef, quiz);

    // 2. Create the resource object to be added to the course data
    const quizResource: Resource = {
      id: quiz.id, // Use quiz ID for consistency
      title: quiz.title,
      url: `/quiz/${quiz.id}`,
      createdAt: quiz.createdAt,
    };

    // 3. Update the main course document using the read-modify-write pattern
    const courseDocRef = doc(db, COURSE_COLLECTION, SINGLE_DOCUMENT_ID);
    const courseDocSnap = await getDoc(courseDocRef);

    if (!courseDocSnap.exists()) {
        throw new Error('Ana ders dökümanı bulunamadı.');
    }

    const courseData = courseDocSnap.data() as CourseData;

    // Deep copy the subjects for the specific grade to avoid mutation issues
    const updatedSubjects = JSON.parse(JSON.stringify(courseData[gradeSlug].subjects));
    
    const subjectIndex = updatedSubjects.findIndex((s: Subject) => s.id === subjectId);
    
    if (subjectIndex === -1) {
      throw new Error(`Ders konusu (ID: ${subjectId}) ${gradeSlug} sınıfında bulunamadı.`);
    }

    // Add the new quiz resource to the applications array of the found subject
    updatedSubjects[subjectIndex].applications.push(quizResource);
    
    // 4. Write the modified subjects array back to Firestore
    const fieldPath = `${gradeSlug}.subjects`;
    await updateDoc(courseDocRef, {
      [fieldPath]: updatedSubjects
    });
    
    // 5. Revalidate paths to show changes immediately
    revalidatePath('/admin');
    revalidatePath(`/${gradeSlug}`);

    return { success: true, quizId: quiz.id };
  } catch (error: any) {
    console.error('Quiz kaydedilirken veya kaynak olarak eklenirken bir hata oluştu:', error);
    // Throw a more specific error to the client
    throw new Error(`Quiz kaydedilirken veya kaynak olarak eklenirken bir hata oluştu: ${error.message}`);
  }
}

export async function getQuizData(quizId: string): Promise<Quiz | null> {
    try {
        const docRef = doc(db, QUIZZES_COLLECTION, quizId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as Quiz;
        } else {
            console.log(`No quiz found with ID: ${quizId}`);
            return null;
        }
    } catch(error) {
        console.error("Error fetching quiz data:", error);
        return null;
    }
}
