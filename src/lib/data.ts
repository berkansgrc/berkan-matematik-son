

export interface Resource {
  id: string;
  title: string;
  url: string;
  createdAt?: string; // ISO 8601 date string
}

export type ResourceCategory = 'videos' | 'documents' | 'applications';

export interface Subject {
  id: string;
  title: string;
  videos: Resource[];
  documents: Resource[];
  applications: Resource[];
}

export interface GradeData {
  name: string;
  description: string;
  subjects: Subject[];
}

export type GradeSlug = '5-sinif' | '6-sinif' | '7-sinif' | 'lgs';

export type CourseData = Record<GradeSlug, GradeData>;

export interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

export const grades: { slug: GradeSlug; name: string; description: string }[] = [
  { slug: '5-sinif', name: '5. Sınıf', description: 'Ortaokulun ilk adımı için tüm konular.' },
  { slug: '6-sinif', name: '6. Sınıf', description: 'Matematik temellerini sağlamlaştırın.' },
  { slug: '7-sinif', name: '7. Sınıf', description: 'LGS öncesi kritik yılın konuları.' },
  { slug: 'lgs', name: 'LGS Hazırlık', description: 'Liselere Geçiş Sınavı\'na özel hazırlık.' },
];

// This is now primarily used for seeding data and providing static info like name/description
export const courseData: CourseData = {
  '5-sinif': {
    name: '5. Sınıf',
    description: 'Ortaokulun ilk adımı için tüm konular.',
    subjects: [
        {
            id: 's5-1',
            title: 'Doğal Sayılar',
            videos: [
                { id: 'v5-1', title: 'Doğal Sayılarla İşlemler', url: 'https://www.youtube.com', createdAt: '2023-10-26T10:00:00Z' },
            ],
            documents: [
                 { id: 'd5-2', title: 'Doğal Sayılar Çalışma Kağıdı', url: '#', createdAt: '2023-10-27T11:00:00Z' },
            ],
            applications: [
                 { id: 'a5-1', title: 'Sayı Örüntüleri Oyunu', url: '#', createdAt: '2023-10-26T10:00:00Z' },
            ]
        },
        {
            id: 's5-2',
            title: 'Kesirler',
            videos: [
                { id: 'v5-2', title: 'Kesirler ve Kesirlerle İşlemler', url: 'https://www.youtube.com', createdAt: '2023-10-27T11:00:00Z' },
            ],
            documents: [
                { id: 'd5-1', title: '5. Sınıf Konu Anlatım Föyü', url: '#', createdAt: '2023-10-26T10:00:00Z' },
            ],
            applications: []
        }
    ]
  },
  '6-sinif': {
    name: '6. Sınıf',
    description: 'Matematik temellerini sağlamlaştırın.',
    subjects: []
  },
  '7-sinif': {
    name: '7. Sınıf',
    description: 'LGS öncesi kritik yılın konuları.',
    subjects: []
  },
  lgs: {
    name: 'LGS Hazırlık',
    description: 'Liselere Geçiş Sınavı\'na özel hazırlık.',
    subjects: []
  },
};
