
export interface Resource {
  id: string;
  title: string;
  url: string;
}

export type ResourceCategory = 'videos' | 'documents' | 'applications';

export interface GradeContent {
  videos: Resource[];
  documents: Resource[];
  applications: Resource[];
}

export interface GradeData extends GradeContent {
  name: string;
  description: string;
}

export type GradeSlug = '5-sinif' | '6-sinif' | '7-sinif' | 'lgs';

export type CourseData = Record<GradeSlug, GradeData>;

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
    videos: [
      { id: 'v5-1', title: 'Doğal Sayılarla İşlemler', url: 'https://www.youtube.com' },
      { id: 'v5-2', title: 'Kesirler ve Kesirlerle İşlemler', url: 'https://www.youtube.com' },
    ],
    documents: [
      { id: 'd5-1', title: '5. Sınıf Konu Anlatım Föyü', url: '#' },
      { id: 'd5-2', title: 'Doğal Sayılar Çalışma Kağıdı', url: '#' },
    ],
    applications: [
      { id: 'a5-1', title: 'Sayı Örüntüleri Oyunu', url: '#' },
    ],
  },
  '6-sinif': {
    name: '6. Sınıf',
    description: 'Matematik temellerini sağlamlaştırın.',
    videos: [
      { id: 'v6-1', title: 'Tam Sayılar ve İşlemler', url: 'https://www.youtube.com' },
      { id: 'v6-2', title: 'Oran ve Orantı', url: 'https://www.youtube.com' },
    ],
    documents: [
      { id: 'd6-1', title: '6. Sınıf Soru Bankası (PDF)', url: '#' },
    ],
    applications: [],
  },
  '7-sinif': {
    name: '7. Sınıf',
    description: 'LGS öncesi kritik yılın konuları.',
    videos: [
      { id: 'v7-1', title: 'Rasyonel Sayılarla İşlemler', url: 'https://www.youtube.com' },
      { id: 'v7-2', title: 'Cebirsel İfadeler', url: 'https://www.youtube.com' },
    ],
    documents: [
      { id: 'd7-1', title: '7. Sınıf Genel Tekrar Testi', url: '#' },
    ],
    applications: [
      { id: 'a7-1', title: 'Denklem Çözme Simülatörü', url: '#' },
    ],
  },
  lgs: {
    name: 'LGS Hazırlık',
    description: 'Liselere Geçiş Sınavı\'na özel hazırlık.',
    videos: [
      { id: 'vlgs-1', title: 'Çarpanlar ve Katlar', url: 'https://www.youtube.com' },
      { id: 'vlgs-2', title: 'Üslü İfadeler', url: 'https://www.youtube.com' },
      { id: 'vlgs-3', title: 'Kareköklü İfadeler', url: 'https://www.youtube.com' },
    ],
    documents: [
      { id: 'dlgs-1', title: 'LGS Deneme Sınavı 1 (PDF)', url: '#' },
      { id: 'dlgs-2', title: 'LGS Çıkmış Sorular', url: '#' },
    ],
    applications: [
      { id: 'algs-1', title: 'LGS Puan Hesaplama', url: '#' },
    ],
  },
};
