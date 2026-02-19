export type CourseCurrency = "RON" | "EUR";
export type CourseStatus = "draft" | "published" | "scheduled";

export interface CourseCurriculumLesson {
  id: string;
  title: string;
  durationMinutes: number | null;
  summary: string;
  isCompleted: boolean;
  order: number;
}

export interface SafeCourse {
  id: string;
  title: string;
  description: string;
  categoryIds: string[];
  price: number;
  currency: CourseCurrency;
  status: CourseStatus;
  featuredOnHome: boolean;
  scheduledAt: string | null;
  hasCustomThumbnail: boolean;
  thumbnailUrl: string | null;
  hasVimeoPreview: boolean;
  previewVimeoId: string | null;
  updatedAt: string | null;
}

export interface SafeCourseDetail extends SafeCourse {
  curriculumLessons: CourseCurriculumLesson[];
  notesContent: string;
  contactContent: string;
}

export interface CourseStateResponse {
  course: SafeCourseDetail;
  isVisible: boolean;
  hasAccess: boolean;
}

export interface CoursesHomeResponse {
  latestCourses: SafeCourse[];
  featuredCourses: SafeCourse[];
}

export interface CoursesListResponse {
  courses: SafeCourse[];
}

export interface PurchasedCourseItem {
  courseId: string;
  status: string;
  purchasedAt: string | null;
  amountPaid: number;
  currency: string;
  courseMissing: boolean;
  course: SafeCourse | null;
}

export interface PurchasedCoursesResponse {
  purchases: PurchasedCourseItem[];
}

export interface PlaybackResponse {
  provider: "vimeo";
  vimeoId: string;
}

export interface CourseCertificateDownloadResult {
  uri: string;
  fileName: string;
  mimeType: string;
}

export interface BillingDetails {
  billingType?: "individual" | "corporate";
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  company?: {
    name?: string;
    vat?: string;
    reg?: string;
    address?: string;
  };
  invoicePreferences?: {
    sendEmail?: boolean;
    eInvoice?: boolean;
    dueDays?: number | null;
  };
}

export interface CreateCheckoutSessionRequest {
  courseId: string;
  successUrl?: string;
  cancelUrl?: string;
  platform?: string; // "expo"
  billingDetails?: BillingDetails;
}

export interface CreateCheckoutSessionResponse {
  url: string;
  sessionId: string;
}
