import i18n from "../../../i18n";

export type CourseTextKey =
  | "back"
  | "coursesTitle"
  | "coursesSubtitle"
  | "purchasedCourses"
  | "loadingCourses"
  | "loadCoursesErrorTitle"
  | "retry"
  | "noCoursesAvailable"
  | "coursesAvailableSoon"
  | "noImage"
  | "featured"
  | "untitledCourse"
  | "noDescription"
  | "open"
  | "unlockToPlayFullCourse"
  | "loadingPlayback"
  | "playbackErrorTitle"
  | "playbackUnavailableTitle"
  | "playbackNotReady"
  | "previewUnavailableTitle"
  | "previewNotAvailable"
  | "materials"
  | "notes"
  | "contact"
  | "durationNotSpecified"
  | "noLessonsAvailable"
  | "curriculumComingSoon"
  | "untitledLesson"
  | "sectionSummary"
  | "summaryComingSoon"
  | "curriculum"
  | "progressCompleted"
  | "noLessons"
  | "noCurriculumDetails"
  | "finalTest"
  | "finalTestAfterLessons"
  | "certificate"
  | "certificateAfterFinalTest"
  | "certificateLocked"
  | "downloadCertificate"
  | "certificateDownloadingToast"
  | "certificateDownloadSuccessToast"
  | "certificateDownloadErrorToast"
  | "certificateUnavailableToast"
  | "calendarTitle"
  | "calendarOpenError"
  | "courseShared"
  | "shareCanceled"
  | "courseUnavailableTitle"
  | "courseUnavailableDescription"
  | "accessGrantedTitle"
  | "accessGrantedDescription"
  | "purchaseCourseTitle"
  | "purchaseCourseDescription"
  | "purchase"
  | "loginRequiredTitle"
  | "loginRequiredDescription"
  | "login"
  | "register"
  | "missingCourseId"
  | "backToCourses"
  | "purchased"
  | "paymentSuccessful"
  | "checkingAccess"
  | "dismiss"
  | "checkoutCanceled"
  | "checkoutCanceledDescription"
  | "checkoutError"
  | "checkoutStarting"
  | "checkoutAccessCheckingToast"
  | "checkoutSuccessToast"
  | "checkoutCanceledToast"
  | "checkoutErrorToast"
  | "closeToast"
  | "checkoutBillingTitle"
  | "checkoutBillingSubtitle"
  | "billingTypeIndividual"
  | "billingTypeCorporate"
  | "billingFirstName"
  | "billingLastName"
  | "billingEmail"
  | "billingPhone"
  | "billingAddressLine1"
  | "billingAddressLine2"
  | "billingCity"
  | "billingState"
  | "billingPostalCode"
  | "billingCountry"
  | "billingCompanyName"
  | "billingCompanyVat"
  | "billingCompanyReg"
  | "billingCompanyAddress"
  | "billingContinueToPayment"
  | "billingCancel"
  | "billingRequiredField"
  | "billingInvalidEmail"
  | "billingInvalidPhone"
  | "loadingCourse"
  | "loadCourseErrorTitle"
  | "courseDetailsSoon"
  | "addToCalendar"
  | "share"
  | "shareCourseAppTemplate"
  | "storeGooglePlay"
  | "storeAppStore"
  | "notesUnavailable"
  | "contactUnavailable"
  | "accessChecking"
  | "redirectingToLogin"
  | "purchasedCoursesSubtitle"
  | "browseCourses"
  | "loadingPurchasedCourses"
  | "loadPurchasesErrorTitle"
  | "noPurchasedCourses"
  | "purchasedCoursesEmptyDescription"
  | "unavailableCourse"
  | "unavailable"
  | "courseNoLongerAvailable"
  | "purchasedLabel"
  | "amountLabel"
  | "openCourse"
  | "courseDetailsUnavailable"
  | "courseSession";

type CourseTranslations = Record<CourseTextKey, string>;

const EN_TRANSLATIONS: CourseTranslations = {
  back: "Back",
  coursesTitle: "Courses",
  coursesSubtitle: "Explore premium video courses and learn at your own pace.",
  purchasedCourses: "Purchased courses",
  loadingCourses: "Loading courses...",
  loadCoursesErrorTitle: "Could not load courses",
  retry: "Retry",
  noCoursesAvailable: "No courses available",
  coursesAvailableSoon:
    "Published courses will be listed here as soon as they become available.",
  noImage: "no image",
  featured: "Featured",
  untitledCourse: "Untitled course",
  noDescription: "No description available.",
  open: "Open",
  unlockToPlayFullCourse: "Unlock to play full course",
  loadingPlayback: "Loading playback...",
  playbackErrorTitle: "Playback error",
  playbackUnavailableTitle: "Playback unavailable",
  playbackNotReady: "Your access is active but playback is not ready yet.",
  previewUnavailableTitle: "Preview unavailable",
  previewNotAvailable: "No preview media is available for this course yet.",
  materials: "Materials",
  notes: "Notes",
  contact: "Contact",
  durationNotSpecified: "Duration not specified",
  noLessonsAvailable: "No lessons available",
  curriculumComingSoon: "Curriculum items will appear here when they are published.",
  untitledLesson: "Untitled lesson",
  sectionSummary: "Section summary",
  summaryComingSoon: "Summary will be available soon.",
  curriculum: "Curriculum",
  progressCompleted: "%{completed}/%{total} completed",
  noLessons: "No lessons",
  noCurriculumDetails: "No curriculum details yet.",
  finalTest: "Final test",
  finalTestAfterLessons: "Available after all lessons are completed.",
  certificate: "Certificate",
  certificateAfterFinalTest: "Certificate can be generated after final test.",
  certificateLocked: "Certificate is locked until course access is granted.",
  downloadCertificate: "Download certificate",
  certificateDownloadingToast: "Preparing certificate...",
  certificateDownloadSuccessToast: "Certificate ready to save or share.",
  certificateDownloadErrorToast: "Could not download certificate",
  certificateUnavailableToast: "Certificate is not available for this course yet.",
  calendarTitle: "Calendar",
  calendarOpenError: "Unable to open calendar right now.",
  courseShared: "Course shared",
  shareCanceled: "Share canceled",
  courseUnavailableTitle: "Course unavailable",
  courseUnavailableDescription:
    "This course is currently not visible for purchase. It may be scheduled or temporarily unavailable.",
  accessGrantedTitle: "Access granted",
  accessGrantedDescription: "Your entitlement is active. You can watch this course now.",
  purchaseCourseTitle: "Purchase this course",
  purchaseCourseDescription: "Complete checkout to unlock full playback.",
  purchase: "Purchase",
  loginRequiredTitle: "Login required",
  loginRequiredDescription:
    "Sign in or register to complete checkout and access this course.",
  login: "Login",
  register: "Register",
  missingCourseId: "Missing course id",
  backToCourses: "Back to courses",
  purchased: "Purchased",
  paymentSuccessful: "Payment successful",
  checkingAccess: "Checking access. This can take a few moments.",
  dismiss: "Dismiss",
  checkoutCanceled: "Checkout canceled",
  checkoutCanceledDescription: "You can continue anytime and try again.",
  checkoutError: "Checkout error",
  checkoutStarting: "Initializing checkout...",
  checkoutAccessCheckingToast: "Checking course access...",
  checkoutSuccessToast: "Payment confirmed. Access is updating.",
  checkoutCanceledToast: "Checkout canceled.",
  checkoutErrorToast: "Checkout failed",
  closeToast: "Close",
  checkoutBillingTitle: "Billing details",
  checkoutBillingSubtitle: "Complete all invoice fields to continue checkout.",
  billingTypeIndividual: "Individual",
  billingTypeCorporate: "Corporate",
  billingFirstName: "First name",
  billingLastName: "Last name",
  billingEmail: "Email",
  billingPhone: "Phone",
  billingAddressLine1: "Address line 1",
  billingAddressLine2: "Address line 2 (optional)",
  billingCity: "City",
  billingState: "State / County",
  billingPostalCode: "Postal code",
  billingCountry: "Country",
  billingCompanyName: "Company name",
  billingCompanyVat: "VAT code",
  billingCompanyReg: "Registration no.",
  billingCompanyAddress: "Company address",
  billingContinueToPayment: "Continue to payment",
  billingCancel: "Cancel",
  billingRequiredField: "%{field} is required",
  billingInvalidEmail: "Please enter a valid email",
  billingInvalidPhone: "Please enter a valid phone number",
  loadingCourse: "Loading course...",
  loadCourseErrorTitle: "Could not load this course",
  courseDetailsSoon: "Course details are coming soon.",
  addToCalendar: "Add to calendar",
  share: "Share",
  shareCourseAppTemplate:
    'Watch the course "%{courseTitle}" in the Cristina Zurba app. Download the app from %{storeName}: %{storeUrl}',
  storeGooglePlay: "Google Play",
  storeAppStore: "App Store",
  notesUnavailable: "Notes are not available yet.",
  contactUnavailable: "Contact details are not available yet.",
  accessChecking: "Access checking...",
  redirectingToLogin: "Redirecting to login...",
  purchasedCoursesSubtitle: "All your paid courses in one place.",
  browseCourses: "Browse courses",
  loadingPurchasedCourses: "Loading purchased courses...",
  loadPurchasesErrorTitle: "Could not load purchases",
  noPurchasedCourses: "No purchased courses",
  purchasedCoursesEmptyDescription:
    "Complete a checkout from course details to see purchases here.",
  unavailableCourse: "Unavailable course",
  unavailable: "Unavailable",
  courseNoLongerAvailable: "This course is no longer available in catalog.",
  purchasedLabel: "Purchased:",
  amountLabel: "Amount:",
  openCourse: "Open course",
  courseDetailsUnavailable: "Course details are not available anymore.",
  courseSession: "Course session",
};

const RO_TRANSLATIONS: Partial<CourseTranslations> = {
  back: "Înapoi",
  coursesTitle: "Cursuri",
  coursesSubtitle:
    "Explorează cursuri video premium și învață în ritmul tău.",
  purchasedCourses: "Cursuri cumpărate",
  loadingCourses: "Se încarcă cursurile...",
  loadCoursesErrorTitle: "Nu am putut încărca cursurile",
  retry: "Reîncearcă",
  noCoursesAvailable: "Nu există cursuri disponibile",
  coursesAvailableSoon:
    "Cursurile publicate vor apărea aici imediat ce devin disponibile.",
  noImage: "fără imagine",
  featured: "Recomandat",
  untitledCourse: "Curs fără titlu",
  noDescription: "Nu există descriere disponibilă.",
  open: "Deschide",
  unlockToPlayFullCourse: "Deblochează pentru a reda cursul complet",
  loadingPlayback: "Se încarcă redarea...",
  playbackErrorTitle: "Eroare la redare",
  playbackUnavailableTitle: "Redare indisponibilă",
  playbackNotReady: "Ai acces activ, dar redarea nu este pregătită încă.",
  previewUnavailableTitle: "Preview indisponibil",
  previewNotAvailable: "Nu există media de preview pentru acest curs momentan.",
  materials: "Materiale",
  notes: "Notițe",
  contact: "Contact",
  durationNotSpecified: "Durata nu este specificată",
  noLessonsAvailable: "Nu există lecții disponibile",
  curriculumComingSoon: "Elementele curriculei vor apărea aici după publicare.",
  untitledLesson: "Lecție fără titlu",
  sectionSummary: "Rezumat secțiune",
  summaryComingSoon: "Rezumatul va fi disponibil în curând.",
  curriculum: "Curriculum",
  progressCompleted: "%{completed}/%{total} finalizate",
  noLessons: "Fără lecții",
  noCurriculumDetails: "Detaliile curriculei nu sunt disponibile încă.",
  finalTest: "Test final",
  finalTestAfterLessons: "Disponibil după finalizarea tuturor lecțiilor.",
  certificate: "Certificat",
  certificateAfterFinalTest: "Certificatul poate fi generat după testul final.",
  certificateLocked: "Certificatul este blocat până primești acces la curs.",
  downloadCertificate: "Descarcă certificatul",
  certificateDownloadingToast: "Pregătim certificatul...",
  certificateDownloadSuccessToast: "Certificatul este gata pentru salvare sau distribuire.",
  certificateDownloadErrorToast: "Nu am putut descărca certificatul",
  certificateUnavailableToast: "Certificatul nu este disponibil încă pentru acest curs.",
  calendarTitle: "Calendar",
  calendarOpenError: "Nu am putut deschide calendarul acum.",
  courseShared: "Curs distribuit",
  shareCanceled: "Distribuirea a fost anulată",
  courseUnavailableTitle: "Curs indisponibil",
  courseUnavailableDescription:
    "Acest curs nu este vizibil momentan pentru cumpărare. Poate fi programat sau temporar indisponibil.",
  accessGrantedTitle: "Acces activ",
  accessGrantedDescription: "Entitlement-ul este activ. Poți urmări cursul acum.",
  purchaseCourseTitle: "Cumpără acest curs",
  purchaseCourseDescription: "Finalizează checkout-ul pentru a debloca redarea completă.",
  purchase: "Cumpără",
  loginRequiredTitle: "Autentificare necesară",
  loginRequiredDescription:
    "Autentifică-te sau creează cont pentru checkout și acces la curs.",
  login: "Autentificare",
  register: "Înregistrare",
  missingCourseId: "Lipsește identificatorul cursului",
  backToCourses: "Înapoi la cursuri",
  purchased: "Cumpărate",
  paymentSuccessful: "Plată reușită",
  checkingAccess: "Verificăm accesul. Poate dura câteva momente.",
  dismiss: "Închide",
  checkoutCanceled: "Checkout anulat",
  checkoutCanceledDescription: "Poți continua oricând și încerca din nou.",
  checkoutError: "Eroare la checkout",
  checkoutStarting: "Inițializăm checkout-ul...",
  checkoutAccessCheckingToast: "Verificăm accesul la curs...",
  checkoutSuccessToast: "Plata a fost confirmată. Actualizăm accesul.",
  checkoutCanceledToast: "Checkout anulat.",
  checkoutErrorToast: "Checkout eșuat",
  closeToast: "Închide",
  checkoutBillingTitle: "Date de facturare",
  checkoutBillingSubtitle: "Completează toate câmpurile facturii ca să continui checkout-ul.",
  billingTypeIndividual: "Persoană fizică",
  billingTypeCorporate: "Persoană juridică",
  billingFirstName: "Prenume",
  billingLastName: "Nume",
  billingEmail: "Email",
  billingPhone: "Telefon",
  billingAddressLine1: "Adresă linia 1",
  billingAddressLine2: "Adresă linia 2 (opțional)",
  billingCity: "Oraș",
  billingState: "Județ / Regiune",
  billingPostalCode: "Cod poștal",
  billingCountry: "Țară",
  billingCompanyName: "Nume companie",
  billingCompanyVat: "Cod TVA",
  billingCompanyReg: "Nr. înregistrare",
  billingCompanyAddress: "Adresă companie",
  billingContinueToPayment: "Continuă către plată",
  billingCancel: "Anulează",
  billingRequiredField: "Câmp obligatoriu: %{field}",
  billingInvalidEmail: "Te rugăm să introduci un email valid",
  billingInvalidPhone: "Te rugăm să introduci un număr de telefon valid",
  loadingCourse: "Se încarcă cursul...",
  loadCourseErrorTitle: "Nu am putut încărca acest curs",
  courseDetailsSoon: "Detaliile cursului vor fi disponibile în curând.",
  addToCalendar: "Adaugă în calendar",
  share: "Distribuie",
  shareCourseAppTemplate:
    'Vezi cursul "%{courseTitle}" din aplicația Cristina Zurba. Descarcă aplicația din %{storeName}: %{storeUrl}',
  storeGooglePlay: "Google Play",
  storeAppStore: "App Store",
  notesUnavailable: "Notițele nu sunt disponibile încă.",
  contactUnavailable: "Detaliile de contact nu sunt disponibile încă.",
  accessChecking: "Se verifică accesul...",
  redirectingToLogin: "Redirecționare către autentificare...",
  purchasedCoursesSubtitle: "Toate cursurile plătite, într-un singur loc.",
  browseCourses: "Vezi cursurile",
  loadingPurchasedCourses: "Se încarcă cursurile cumpărate...",
  loadPurchasesErrorTitle: "Nu am putut încărca achizițiile",
  noPurchasedCourses: "Nu există cursuri cumpărate",
  purchasedCoursesEmptyDescription:
    "Finalizează un checkout din detaliile cursului pentru a vedea achizițiile aici.",
  unavailableCourse: "Curs indisponibil",
  unavailable: "Indisponibil",
  courseNoLongerAvailable: "Acest curs nu mai este disponibil în catalog.",
  purchasedLabel: "Cumpărat:",
  amountLabel: "Sumă:",
  openCourse: "Deschide cursul",
  courseDetailsUnavailable: "Detaliile cursului nu mai sunt disponibile.",
  courseSession: "Sesiune curs",
};

const LANGUAGE_OVERRIDES: Record<string, Partial<CourseTranslations>> = {
  ro: RO_TRANSLATIONS,
  es: {
    coursesTitle: "Cursos",
    purchasedCourses: "Cursos comprados",
    loadingCourses: "Cargando cursos...",
    loadCoursesErrorTitle: "No se pudieron cargar los cursos",
    noCoursesAvailable: "No hay cursos disponibles",
    browseCourses: "Explorar cursos",
    loadingPurchasedCourses: "Cargando cursos comprados...",
    loadPurchasesErrorTitle: "No se pudieron cargar las compras",
    noPurchasedCourses: "No hay cursos comprados",
    purchase: "Comprar",
    open: "Abrir",
    openCourse: "Abrir curso",
    unavailable: "No disponible",
    loginRequiredTitle: "Inicio de sesión requerido",
    addToCalendar: "Añadir al calendario",
    share: "Compartir",
    shareCourseAppTemplate:
      'Mira el curso "%{courseTitle}" en la aplicación Cristina Zurba. Descarga la aplicación desde %{storeName}: %{storeUrl}',
    storeGooglePlay: "Google Play",
    storeAppStore: "App Store",
    accessChecking: "Verificando acceso...",
    paymentSuccessful: "Pago exitoso",
    checkoutCanceled: "Pago cancelado",
    checkoutStarting: "Iniciando checkout...",
    checkoutAccessCheckingToast: "Verificando acceso al curso...",
    checkoutSuccessToast: "Pago confirmado. Actualizando acceso.",
    checkoutCanceledToast: "Pago cancelado.",
    checkoutErrorToast: "Error en el checkout",
    downloadCertificate: "Descargar certificado",
    certificateDownloadingToast: "Preparando certificado...",
    certificateDownloadSuccessToast: "Certificado listo para guardar o compartir.",
    certificateDownloadErrorToast: "No se pudo descargar el certificado",
    certificateUnavailableToast: "El certificado aún no está disponible para este curso.",
    closeToast: "Cerrar",
  },
  it: {
    coursesTitle: "Corsi",
    purchasedCourses: "Corsi acquistati",
    loadingCourses: "Caricamento corsi...",
    loadCoursesErrorTitle: "Impossibile caricare i corsi",
    noCoursesAvailable: "Nessun corso disponibile",
    browseCourses: "Sfoglia corsi",
    loadingPurchasedCourses: "Caricamento corsi acquistati...",
    loadPurchasesErrorTitle: "Impossibile caricare gli acquisti",
    noPurchasedCourses: "Nessun corso acquistato",
    purchase: "Acquista",
    open: "Apri",
    openCourse: "Apri corso",
    unavailable: "Non disponibile",
    loginRequiredTitle: "Accesso richiesto",
    addToCalendar: "Aggiungi al calendario",
    share: "Condividi",
    shareCourseAppTemplate:
      'Guarda il corso "%{courseTitle}" nell\'app Cristina Zurba. Scarica l\'app da %{storeName}: %{storeUrl}',
    storeGooglePlay: "Google Play",
    storeAppStore: "App Store",
    accessChecking: "Verifica accesso...",
    paymentSuccessful: "Pagamento riuscito",
    checkoutCanceled: "Checkout annullato",
    checkoutStarting: "Avvio checkout...",
    checkoutAccessCheckingToast: "Verifica accesso al corso...",
    checkoutSuccessToast: "Pagamento confermato. Aggiornamento accesso.",
    checkoutCanceledToast: "Checkout annullato.",
    checkoutErrorToast: "Checkout non riuscito",
    downloadCertificate: "Scarica certificato",
    certificateDownloadingToast: "Preparazione certificato...",
    certificateDownloadSuccessToast: "Certificato pronto per salvare o condividere.",
    certificateDownloadErrorToast: "Impossibile scaricare il certificato",
    certificateUnavailableToast: "Il certificato non è ancora disponibile per questo corso.",
    closeToast: "Chiudi",
  },
  pl: {
    coursesTitle: "Kursy",
    purchasedCourses: "Zakupione kursy",
    loadingCourses: "Ładowanie kursów...",
    loadCoursesErrorTitle: "Nie udało się załadować kursów",
    noCoursesAvailable: "Brak dostępnych kursów",
    browseCourses: "Przeglądaj kursy",
    loadingPurchasedCourses: "Ładowanie zakupionych kursów...",
    loadPurchasesErrorTitle: "Nie udało się załadować zakupów",
    noPurchasedCourses: "Brak zakupionych kursów",
    purchase: "Kup",
    open: "Otwórz",
    openCourse: "Otwórz kurs",
    unavailable: "Niedostępny",
    loginRequiredTitle: "Wymagane logowanie",
    addToCalendar: "Dodaj do kalendarza",
    share: "Udostępnij",
    shareCourseAppTemplate:
      'Zobacz kurs "%{courseTitle}" w aplikacji Cristina Zurba. Pobierz aplikację z %{storeName}: %{storeUrl}',
    storeGooglePlay: "Google Play",
    storeAppStore: "App Store",
    accessChecking: "Sprawdzanie dostępu...",
    paymentSuccessful: "Płatność udana",
    checkoutCanceled: "Zakup anulowany",
    checkoutStarting: "Inicjowanie zakupu...",
    checkoutAccessCheckingToast: "Sprawdzanie dostępu do kursu...",
    checkoutSuccessToast: "Płatność potwierdzona. Aktualizujemy dostęp.",
    checkoutCanceledToast: "Zakup anulowany.",
    checkoutErrorToast: "Błąd zakupu",
    downloadCertificate: "Pobierz certyfikat",
    certificateDownloadingToast: "Przygotowywanie certyfikatu...",
    certificateDownloadSuccessToast: "Certyfikat gotowy do zapisania lub udostępnienia.",
    certificateDownloadErrorToast: "Nie udało się pobrać certyfikatu",
    certificateUnavailableToast: "Certyfikat nie jest jeszcze dostępny dla tego kursu.",
    closeToast: "Zamknij",
  },
  bg: {
    coursesTitle: "Курсове",
    purchasedCourses: "Закупени курсове",
    loadingCourses: "Зареждане на курсове...",
    loadCoursesErrorTitle: "Неуспешно зареждане на курсовете",
    noCoursesAvailable: "Няма налични курсове",
    browseCourses: "Разгледай курсовете",
    loadingPurchasedCourses: "Зареждане на закупените курсове...",
    loadPurchasesErrorTitle: "Неуспешно зареждане на покупките",
    noPurchasedCourses: "Няма закупени курсове",
    purchase: "Купи",
    open: "Отвори",
    openCourse: "Отвори курс",
    unavailable: "Недостъпен",
    loginRequiredTitle: "Нужен е вход",
    addToCalendar: "Добави в календара",
    share: "Сподели",
    shareCourseAppTemplate:
      'Виж курса "%{courseTitle}" в приложението Cristina Zurba. Изтегли приложението от %{storeName}: %{storeUrl}',
    storeGooglePlay: "Google Play",
    storeAppStore: "App Store",
    accessChecking: "Проверка на достъпа...",
    paymentSuccessful: "Плащането е успешно",
    checkoutCanceled: "Плащането е отменено",
    checkoutStarting: "Стартиране на плащането...",
    checkoutAccessCheckingToast: "Проверява се достъпът до курса...",
    checkoutSuccessToast: "Плащането е потвърдено. Актуализираме достъпа.",
    checkoutCanceledToast: "Плащането е отменено.",
    checkoutErrorToast: "Грешка при плащане",
    downloadCertificate: "Изтегли сертификата",
    certificateDownloadingToast: "Подготвяме сертификата...",
    certificateDownloadSuccessToast: "Сертификатът е готов за запазване или споделяне.",
    certificateDownloadErrorToast: "Сертификатът не можа да бъде изтеглен",
    certificateUnavailableToast: "Сертификатът все още не е наличен за този курс.",
    closeToast: "Затвори",
  },
  cs: {
    coursesTitle: "Kurzy",
    purchasedCourses: "Zakoupené kurzy",
    loadingCourses: "Načítání kurzů...",
    loadCoursesErrorTitle: "Kurzy se nepodařilo načíst",
    noCoursesAvailable: "Žádné dostupné kurzy",
    browseCourses: "Procházet kurzy",
    loadingPurchasedCourses: "Načítání zakoupených kurzů...",
    loadPurchasesErrorTitle: "Nákupy se nepodařilo načíst",
    noPurchasedCourses: "Žádné zakoupené kurzy",
    purchase: "Koupit",
    open: "Otevřít",
    openCourse: "Otevřít kurz",
    unavailable: "Nedostupné",
    loginRequiredTitle: "Je vyžadováno přihlášení",
    addToCalendar: "Přidat do kalendáře",
    share: "Sdílet",
    shareCourseAppTemplate:
      'Podívej se na kurz "%{courseTitle}" v aplikaci Cristina Zurba. Stáhni aplikaci z %{storeName}: %{storeUrl}',
    storeGooglePlay: "Google Play",
    storeAppStore: "App Store",
    accessChecking: "Ověřování přístupu...",
    paymentSuccessful: "Platba byla úspěšná",
    checkoutCanceled: "Checkout zrušen",
    checkoutStarting: "Spouští se checkout...",
    checkoutAccessCheckingToast: "Ověřuje se přístup ke kurzu...",
    checkoutSuccessToast: "Platba potvrzena. Aktualizujeme přístup.",
    checkoutCanceledToast: "Checkout zrušen.",
    checkoutErrorToast: "Checkout selhal",
    downloadCertificate: "Stáhnout certifikát",
    certificateDownloadingToast: "Připravujeme certifikát...",
    certificateDownloadSuccessToast: "Certifikát je připraven k uložení nebo sdílení.",
    certificateDownloadErrorToast: "Certifikát se nepodařilo stáhnout",
    certificateUnavailableToast: "Certifikát zatím není pro tento kurz dostupný.",
    closeToast: "Zavřít",
  },
  de: {
    coursesTitle: "Kurse",
    purchasedCourses: "Gekaufte Kurse",
    loadingCourses: "Kurse werden geladen...",
    loadCoursesErrorTitle: "Kurse konnten nicht geladen werden",
    noCoursesAvailable: "Keine Kurse verfügbar",
    browseCourses: "Kurse durchsuchen",
    loadingPurchasedCourses: "Gekaufte Kurse werden geladen...",
    loadPurchasesErrorTitle: "Käufe konnten nicht geladen werden",
    noPurchasedCourses: "Keine gekauften Kurse",
    purchase: "Kaufen",
    open: "Öffnen",
    openCourse: "Kurs öffnen",
    unavailable: "Nicht verfügbar",
    loginRequiredTitle: "Anmeldung erforderlich",
    addToCalendar: "Zum Kalender hinzufügen",
    share: "Teilen",
    shareCourseAppTemplate:
      'Sieh dir den Kurs "%{courseTitle}" in der Cristina Zurba App an. Lade die App aus %{storeName} herunter: %{storeUrl}',
    storeGooglePlay: "Google Play",
    storeAppStore: "App Store",
    accessChecking: "Zugriff wird geprüft...",
    paymentSuccessful: "Zahlung erfolgreich",
    checkoutCanceled: "Checkout abgebrochen",
    checkoutStarting: "Checkout wird gestartet...",
    checkoutAccessCheckingToast: "Kurszugriff wird geprüft...",
    checkoutSuccessToast: "Zahlung bestätigt. Zugriff wird aktualisiert.",
    checkoutCanceledToast: "Checkout abgebrochen.",
    checkoutErrorToast: "Checkout fehlgeschlagen",
    downloadCertificate: "Zertifikat herunterladen",
    certificateDownloadingToast: "Zertifikat wird vorbereitet...",
    certificateDownloadSuccessToast: "Zertifikat ist zum Speichern oder Teilen bereit.",
    certificateDownloadErrorToast: "Zertifikat konnte nicht heruntergeladen werden",
    certificateUnavailableToast: "Das Zertifikat ist für diesen Kurs noch nicht verfügbar.",
    closeToast: "Schließen",
  },
  el: {
    coursesTitle: "Μαθήματα",
    purchasedCourses: "Αγορασμένα μαθήματα",
    loadingCourses: "Φόρτωση μαθημάτων...",
    loadCoursesErrorTitle: "Δεν ήταν δυνατή η φόρτωση μαθημάτων",
    noCoursesAvailable: "Δεν υπάρχουν διαθέσιμα μαθήματα",
    browseCourses: "Περιήγηση μαθημάτων",
    loadingPurchasedCourses: "Φόρτωση αγορασμένων μαθημάτων...",
    loadPurchasesErrorTitle: "Δεν ήταν δυνατή η φόρτωση αγορών",
    noPurchasedCourses: "Δεν υπάρχουν αγορασμένα μαθήματα",
    purchase: "Αγορά",
    open: "Άνοιγμα",
    openCourse: "Άνοιγμα μαθήματος",
    unavailable: "Μη διαθέσιμο",
    loginRequiredTitle: "Απαιτείται σύνδεση",
    addToCalendar: "Προσθήκη στο ημερολόγιο",
    share: "Κοινοποίηση",
    shareCourseAppTemplate:
      'Δες το μάθημα "%{courseTitle}" στην εφαρμογή Cristina Zurba. Κατέβασε την εφαρμογή από το %{storeName}: %{storeUrl}',
    storeGooglePlay: "Google Play",
    storeAppStore: "App Store",
    accessChecking: "Έλεγχος πρόσβασης...",
    paymentSuccessful: "Η πληρωμή ήταν επιτυχής",
    checkoutCanceled: "Η αγορά ακυρώθηκε",
    checkoutStarting: "Εκκίνηση checkout...",
    checkoutAccessCheckingToast: "Γίνεται έλεγχος πρόσβασης στο μάθημα...",
    checkoutSuccessToast: "Η πληρωμή επιβεβαιώθηκε. Ενημερώνεται η πρόσβαση.",
    checkoutCanceledToast: "Η αγορά ακυρώθηκε.",
    checkoutErrorToast: "Αποτυχία checkout",
    downloadCertificate: "Λήψη πιστοποιητικού",
    certificateDownloadingToast: "Προετοιμασία πιστοποιητικού...",
    certificateDownloadSuccessToast: "Το πιστοποιητικό είναι έτοιμο για αποθήκευση ή κοινοποίηση.",
    certificateDownloadErrorToast: "Δεν ήταν δυνατή η λήψη του πιστοποιητικού",
    certificateUnavailableToast: "Το πιστοποιητικό δεν είναι ακόμη διαθέσιμο για αυτό το μάθημα.",
    closeToast: "Κλείσιμο",
  },
  fr: {
    coursesTitle: "Cours",
    purchasedCourses: "Cours achetés",
    loadingCourses: "Chargement des cours...",
    loadCoursesErrorTitle: "Impossible de charger les cours",
    noCoursesAvailable: "Aucun cours disponible",
    browseCourses: "Parcourir les cours",
    loadingPurchasedCourses: "Chargement des cours achetés...",
    loadPurchasesErrorTitle: "Impossible de charger les achats",
    noPurchasedCourses: "Aucun cours acheté",
    purchase: "Acheter",
    open: "Ouvrir",
    openCourse: "Ouvrir le cours",
    unavailable: "Indisponible",
    loginRequiredTitle: "Connexion requise",
    addToCalendar: "Ajouter au calendrier",
    share: "Partager",
    shareCourseAppTemplate:
      'Regarde le cours "%{courseTitle}" dans l\'application Cristina Zurba. Télécharge l\'application depuis %{storeName} : %{storeUrl}',
    storeGooglePlay: "Google Play",
    storeAppStore: "App Store",
    accessChecking: "Vérification de l'accès...",
    paymentSuccessful: "Paiement réussi",
    checkoutCanceled: "Paiement annulé",
    checkoutStarting: "Initialisation du paiement...",
    checkoutAccessCheckingToast: "Vérification de l'accès au cours...",
    checkoutSuccessToast: "Paiement confirmé. Mise à jour de l'accès.",
    checkoutCanceledToast: "Paiement annulé.",
    checkoutErrorToast: "Échec du paiement",
    downloadCertificate: "Télécharger le certificat",
    certificateDownloadingToast: "Préparation du certificat...",
    certificateDownloadSuccessToast: "Le certificat est prêt à être enregistré ou partagé.",
    certificateDownloadErrorToast: "Impossible de télécharger le certificat",
    certificateUnavailableToast: "Le certificat n'est pas encore disponible pour ce cours.",
    closeToast: "Fermer",
  },
  hi: {
    coursesTitle: "कोर्स",
    purchasedCourses: "खरीदे गए कोर्स",
    loadingCourses: "कोर्स लोड हो रहे हैं...",
    loadCoursesErrorTitle: "कोर्स लोड नहीं हो सके",
    noCoursesAvailable: "कोई कोर्स उपलब्ध नहीं है",
    browseCourses: "कोर्स देखें",
    loadingPurchasedCourses: "खरीदे गए कोर्स लोड हो रहे हैं...",
    loadPurchasesErrorTitle: "खरीदारी लोड नहीं हो सकी",
    noPurchasedCourses: "कोई खरीदा गया कोर्स नहीं है",
    purchase: "खरीदें",
    open: "खोलें",
    openCourse: "कोर्स खोलें",
    unavailable: "उपलब्ध नहीं",
    loginRequiredTitle: "लॉगिन आवश्यक",
    addToCalendar: "कैलेंडर में जोड़ें",
    share: "शेयर करें",
    shareCourseAppTemplate:
      '"%{courseTitle}" कोर्स को Cristina Zurba ऐप में देखें। ऐप को %{storeName} से डाउनलोड करें: %{storeUrl}',
    storeGooglePlay: "Google Play",
    storeAppStore: "App Store",
    accessChecking: "एक्सेस जाँची जा रही है...",
    paymentSuccessful: "भुगतान सफल",
    checkoutCanceled: "चेकआउट रद्द किया गया",
    checkoutStarting: "चेकआउट शुरू किया जा रहा है...",
    checkoutAccessCheckingToast: "कोर्स एक्सेस जाँचा जा रहा है...",
    checkoutSuccessToast: "भुगतान की पुष्टि हो गई। एक्सेस अपडेट हो रहा है।",
    checkoutCanceledToast: "चेकआउट रद्द किया गया।",
    checkoutErrorToast: "चेकआउट विफल",
    downloadCertificate: "प्रमाणपत्र डाउनलोड करें",
    certificateDownloadingToast: "प्रमाणपत्र तैयार किया जा रहा है...",
    certificateDownloadSuccessToast: "प्रमाणपत्र सेव या साझा करने के लिए तैयार है।",
    certificateDownloadErrorToast: "प्रमाणपत्र डाउनलोड नहीं हो सका",
    certificateUnavailableToast: "यह प्रमाणपत्र अभी इस कोर्स के लिए उपलब्ध नहीं है।",
    closeToast: "बंद करें",
  },
  id: {
    coursesTitle: "Kursus",
    purchasedCourses: "Kursus yang dibeli",
    loadingCourses: "Memuat kursus...",
    loadCoursesErrorTitle: "Tidak dapat memuat kursus",
    noCoursesAvailable: "Tidak ada kursus tersedia",
    browseCourses: "Jelajahi kursus",
    loadingPurchasedCourses: "Memuat kursus yang dibeli...",
    loadPurchasesErrorTitle: "Tidak dapat memuat pembelian",
    noPurchasedCourses: "Tidak ada kursus yang dibeli",
    purchase: "Beli",
    open: "Buka",
    openCourse: "Buka kursus",
    unavailable: "Tidak tersedia",
    loginRequiredTitle: "Login diperlukan",
    addToCalendar: "Tambahkan ke kalender",
    share: "Bagikan",
    shareCourseAppTemplate:
      'Lihat kursus "%{courseTitle}" di aplikasi Cristina Zurba. Unduh aplikasi dari %{storeName}: %{storeUrl}',
    storeGooglePlay: "Google Play",
    storeAppStore: "App Store",
    accessChecking: "Memeriksa akses...",
    paymentSuccessful: "Pembayaran berhasil",
    checkoutCanceled: "Checkout dibatalkan",
    checkoutStarting: "Memulai checkout...",
    checkoutAccessCheckingToast: "Memeriksa akses kursus...",
    checkoutSuccessToast: "Pembayaran dikonfirmasi. Akses sedang diperbarui.",
    checkoutCanceledToast: "Checkout dibatalkan.",
    checkoutErrorToast: "Checkout gagal",
    downloadCertificate: "Unduh sertifikat",
    certificateDownloadingToast: "Menyiapkan sertifikat...",
    certificateDownloadSuccessToast: "Sertifikat siap untuk disimpan atau dibagikan.",
    certificateDownloadErrorToast: "Sertifikat gagal diunduh",
    certificateUnavailableToast: "Sertifikat belum tersedia untuk kursus ini.",
    closeToast: "Tutup",
  },
  sk: {
    coursesTitle: "Kurzy",
    purchasedCourses: "Zakúpené kurzy",
    loadingCourses: "Načítavajú sa kurzy...",
    loadCoursesErrorTitle: "Kurzy sa nepodarilo načítať",
    noCoursesAvailable: "Nie sú dostupné žiadne kurzy",
    browseCourses: "Prehliadať kurzy",
    loadingPurchasedCourses: "Načítavajú sa zakúpené kurzy...",
    loadPurchasesErrorTitle: "Nákupy sa nepodarilo načítať",
    noPurchasedCourses: "Žiadne zakúpené kurzy",
    purchase: "Kúpiť",
    open: "Otvoriť",
    openCourse: "Otvoriť kurz",
    unavailable: "Nedostupné",
    loginRequiredTitle: "Vyžaduje sa prihlásenie",
    addToCalendar: "Pridať do kalendára",
    share: "Zdieľať",
    shareCourseAppTemplate:
      'Pozri si kurz "%{courseTitle}" v aplikácii Cristina Zurba. Stiahni si aplikáciu z %{storeName}: %{storeUrl}',
    storeGooglePlay: "Google Play",
    storeAppStore: "App Store",
    accessChecking: "Kontroluje sa prístup...",
    paymentSuccessful: "Platba úspešná",
    checkoutCanceled: "Checkout zrušený",
    checkoutStarting: "Spúšťa sa checkout...",
    checkoutAccessCheckingToast: "Overuje sa prístup ku kurzu...",
    checkoutSuccessToast: "Platba potvrdená. Aktualizujeme prístup.",
    checkoutCanceledToast: "Checkout zrušený.",
    checkoutErrorToast: "Checkout zlyhal",
    downloadCertificate: "Stiahnuť certifikát",
    certificateDownloadingToast: "Pripravujeme certifikát...",
    certificateDownloadSuccessToast: "Certifikát je pripravený na uloženie alebo zdieľanie.",
    certificateDownloadErrorToast: "Certifikát sa nepodarilo stiahnuť",
    certificateUnavailableToast: "Certifikát zatiaľ nie je pre tento kurz dostupný.",
    closeToast: "Zavrieť",
  },
  ru: {
    coursesTitle: "Курсы",
    purchasedCourses: "Купленные курсы",
    loadingCourses: "Загрузка курсов...",
    loadCoursesErrorTitle: "Не удалось загрузить курсы",
    noCoursesAvailable: "Нет доступных курсов",
    browseCourses: "Смотреть курсы",
    loadingPurchasedCourses: "Загрузка купленных курсов...",
    loadPurchasesErrorTitle: "Не удалось загрузить покупки",
    noPurchasedCourses: "Нет купленных курсов",
    purchase: "Купить",
    open: "Открыть",
    openCourse: "Открыть курс",
    unavailable: "Недоступно",
    loginRequiredTitle: "Требуется вход",
    addToCalendar: "Добавить в календарь",
    share: "Поделиться",
    shareCourseAppTemplate:
      'Смотри курс "%{courseTitle}" в приложении Cristina Zurba. Скачай приложение из %{storeName}: %{storeUrl}',
    storeGooglePlay: "Google Play",
    storeAppStore: "App Store",
    accessChecking: "Проверка доступа...",
    paymentSuccessful: "Оплата успешна",
    checkoutCanceled: "Оплата отменена",
    checkoutStarting: "Запуск оплаты...",
    checkoutAccessCheckingToast: "Проверяем доступ к курсу...",
    checkoutSuccessToast: "Оплата подтверждена. Обновляем доступ.",
    checkoutCanceledToast: "Оплата отменена.",
    checkoutErrorToast: "Ошибка оплаты",
    downloadCertificate: "Скачать сертификат",
    certificateDownloadingToast: "Подготавливаем сертификат...",
    certificateDownloadSuccessToast: "Сертификат готов к сохранению или отправке.",
    certificateDownloadErrorToast: "Не удалось скачать сертификат",
    certificateUnavailableToast: "Сертификат пока недоступен для этого курса.",
    closeToast: "Закрыть",
  },
  tr: {
    coursesTitle: "Kurslar",
    purchasedCourses: "Satın alınan kurslar",
    loadingCourses: "Kurslar yükleniyor...",
    loadCoursesErrorTitle: "Kurslar yüklenemedi",
    noCoursesAvailable: "Kullanılabilir kurs yok",
    browseCourses: "Kurslara göz at",
    loadingPurchasedCourses: "Satın alınan kurslar yükleniyor...",
    loadPurchasesErrorTitle: "Satın alımlar yüklenemedi",
    noPurchasedCourses: "Satın alınan kurs yok",
    purchase: "Satın al",
    open: "Aç",
    openCourse: "Kursu aç",
    unavailable: "Kullanılamıyor",
    loginRequiredTitle: "Giriş gerekli",
    addToCalendar: "Takvime ekle",
    share: "Paylaş",
    shareCourseAppTemplate:
      '"%{courseTitle}" kursunu Cristina Zurba uygulamasında izle. Uygulamayı %{storeName} üzerinden indir: %{storeUrl}',
    storeGooglePlay: "Google Play",
    storeAppStore: "App Store",
    accessChecking: "Erişim kontrol ediliyor...",
    paymentSuccessful: "Ödeme başarılı",
    checkoutCanceled: "Ödeme iptal edildi",
    checkoutStarting: "Ödeme başlatılıyor...",
    checkoutAccessCheckingToast: "Kurs erişimi kontrol ediliyor...",
    checkoutSuccessToast: "Ödeme onaylandı. Erişim güncelleniyor.",
    checkoutCanceledToast: "Ödeme iptal edildi.",
    checkoutErrorToast: "Ödeme başarısız",
    downloadCertificate: "Sertifikayı indir",
    certificateDownloadingToast: "Sertifika hazırlanıyor...",
    certificateDownloadSuccessToast: "Sertifika kaydetmeye veya paylaşmaya hazır.",
    certificateDownloadErrorToast: "Sertifika indirilemedi",
    certificateUnavailableToast: "Sertifika bu kurs için henüz kullanılamıyor.",
    closeToast: "Kapat",
  },
};

const GLOBAL_FALLBACK_KEYS: Partial<Record<CourseTextKey, string>> = {
  back: "videoPlayerBack",
  login: "login",
  register: "register",
  dismiss: "close",
};

const SUPPORTED_LANGUAGES = new Set([
  "en",
  "ro",
  "es",
  "it",
  "pl",
  "bg",
  "cs",
  "de",
  "el",
  "fr",
  "hi",
  "id",
  "sk",
  "ru",
  "tr",
]);

const interpolate = (
  text: string,
  params?: Record<string, string | number>
): string => {
  if (!params) {
    return text;
  }

  return text.replace(/%\{(\w+)\}/g, (_, variable: string) => {
    const value = params[variable];
    return value === undefined || value === null ? "" : String(value);
  });
};

const normalizeLocale = (locale?: string): string => {
  const candidate = String(locale || "").trim().toLowerCase();
  if (!candidate) {
    return "en";
  }

  const shortCode = candidate.split(/[-_]/)[0];
  return SUPPORTED_LANGUAGES.has(shortCode) ? shortCode : "en";
};

const getGlobalFallback = (
  key: CourseTextKey,
  params?: Record<string, string | number>
): string | null => {
  const globalKey = GLOBAL_FALLBACK_KEYS[key];
  if (!globalKey) {
    return null;
  }

  const translated = String(i18n.translate(globalKey));
  if (!translated || translated === globalKey) {
    return null;
  }

  return interpolate(translated, params);
};

export const courseT = (
  locale: string | undefined,
  key: CourseTextKey,
  params?: Record<string, string | number>
): string => {
  const globalFallback = getGlobalFallback(key, params);
  if (globalFallback) {
    return globalFallback;
  }

  const lang = normalizeLocale(locale || i18n.locale);
  const text = LANGUAGE_OVERRIDES[lang]?.[key] || EN_TRANSLATIONS[key];

  return interpolate(text, params);
};
