import { Alert, Linking, Platform } from "react-native";
import Constants from "expo-constants";

const SUPPORT_EMAIL = "webdynamicx@gmail.com";
const DEFAULT_LANGUAGE = "ro";
const MAX_FIELD_LENGTH = 240;
const MAX_EXTRA_CONTEXT_LENGTH = 400;

const ENGLISH_COPY = {
  alertTitle: "A problem occurred",
  genericMessage:
    "A processing error occurred. If you think this is a mistake, send the report to support.",
  paymentInitPublicMessage:
    "We could not initialize the payment. If this seems wrong, send the report to support.",
  paymentFlowPublicMessage:
    "We could not complete the payment or invoice. If this seems wrong, send the report to support.",
  pdfEmailFailedPublicMessage:
    "The PDF could not be sent, and the payment will not be finalized. If this seems wrong, send the report to support.",
  transactionWarning:
    "The payment may already be processed. Do not retry the purchase immediately.",
  reportPrompt:
    "If you think this is a mistake, tap \"Send report\" and an email with technical details will be prepared.",
  referenceLabel: "Error code",
  transactionIdLabel: "Transaction ID",
  closeButton: "Close",
  sendButton: "Send report",
  emailSubjectPrefix: "Payment error report",
  emailGreeting: "Hello,",
  emailIntro:
    "I think an error occurred in the app. I have included the technical details below.",
  emailDescribePrompt:
    "Add here, if you want, what you did before the error appeared:",
  emailDetailsHeader: "Technical details",
  userHeader: "Customer details",
  screenLabel: "Screen",
  productCodeLabel: "Product",
  analysisIdLabel: "Analysis ID",
  analysisTypeLabel: "Analysis type",
  errorCodeLabel: "Internal code",
  messageLabel: "Message",
  languageLabel: "Language",
  platformLabel: "Platform",
  appVersionLabel: "App version",
  emailLabel: "Email",
  phoneLabel: "Phone",
  fullNameLabel: "Name",
  timeLabel: "Time",
  extraContextLabel: "Extra context",
  emailUnavailableTitle: "Could not open the email app",
  emailUnavailableMessage:
    "Please send an email manually to webdynamicx@gmail.com and include this reference code.",
  purchaseSupportMessage:
    "If you have problems with purchases, email webdynamicx@gmail.com for support.",
};

const LOCALIZED_COPY = {
  en: ENGLISH_COPY,
  ro: {
    ...ENGLISH_COPY,
    alertTitle: "A aparut o problema",
    genericMessage:
      "A aparut o eroare la procesare. Daca crezi ca este o greseala, trimite raportul catre suport.",
    paymentInitPublicMessage:
      "Nu am putut initializa plata. Daca problema pare gresita, trimite raportul catre suport.",
    paymentFlowPublicMessage:
      "Nu am putut finaliza plata sau factura. Daca problema pare gresita, trimite raportul catre suport.",
    pdfEmailFailedPublicMessage:
      "PDF-ul nu a putut fi trimis, iar plata nu va fi finalizata. Daca problema pare gresita, trimite raportul catre suport.",
    transactionWarning:
      "Plata poate fi deja procesata. Nu reincerca imediat achizitia.",
    reportPrompt:
      "Daca este o greseala, apasa \"Trimite raport\" si ni se va pregati un email cu detaliile tehnice.",
    referenceLabel: "Cod eroare",
    transactionIdLabel: "ID tranzactie",
    closeButton: "Inchide",
    sendButton: "Trimite raport",
    emailSubjectPrefix: "Raport eroare plata",
    emailGreeting: "Buna,",
    emailIntro:
      "Cred ca a aparut o eroare in aplicatie. Am lasat mai jos detaliile tehnice.",
    emailDescribePrompt:
      "Completeaza aici, daca doresti, ce ai facut inainte sa apara eroarea:",
    emailDetailsHeader: "Date tehnice",
    userHeader: "Date client",
    screenLabel: "Ecran",
    productCodeLabel: "Produs",
    analysisTypeLabel: "Tip analiza",
    errorCodeLabel: "Cod intern",
    messageLabel: "Mesaj",
    languageLabel: "Limba",
    platformLabel: "Platforma",
    appVersionLabel: "Versiune app",
    phoneLabel: "Telefon",
    fullNameLabel: "Nume",
    timeLabel: "Timp",
    extraContextLabel: "Context extra",
    emailUnavailableTitle: "Nu am putut deschide emailul",
    emailUnavailableMessage:
      "Trimite manual un email la webdynamicx@gmail.com si include acest cod.",
    purchaseSupportMessage:
      "Daca aveti probleme cu achizitiile, trimiteti mail la webdynamicx@gmail.com pentru suport.",
  },
  es: {
    ...ENGLISH_COPY,
    alertTitle: "Ocurrio un problema",
    genericMessage:
      "Se produjo un error de procesamiento. Si crees que es un error, envia el informe al soporte.",
    paymentInitPublicMessage:
      "No pudimos iniciar el pago. Si esto parece incorrecto, envia el informe al soporte.",
    paymentFlowPublicMessage:
      "No pudimos completar el pago o la factura. Si esto parece incorrecto, envia el informe al soporte.",
    pdfEmailFailedPublicMessage:
      "No se pudo enviar el PDF y el pago no se finalizara. Si esto parece incorrecto, envia el informe al soporte.",
    transactionWarning:
      "Es posible que el pago ya se haya procesado. No repitas la compra inmediatamente.",
    reportPrompt:
      "Si crees que es un error, pulsa \"Enviar informe\" y prepararemos un correo con los detalles tecnicos.",
    referenceLabel: "Codigo de error",
    transactionIdLabel: "ID de transaccion",
    closeButton: "Cerrar",
    sendButton: "Enviar informe",
    emailUnavailableTitle: "No se pudo abrir la app de correo",
    emailUnavailableMessage:
      "Envia manualmente un correo a webdynamicx@gmail.com e incluye este codigo de referencia.",
    purchaseSupportMessage:
      "Si tienes problemas con las compras, escribe a webdynamicx@gmail.com para recibir soporte.",
  },
  it: {
    ...ENGLISH_COPY,
    alertTitle: "Si e verificato un problema",
    genericMessage:
      "Si e verificato un errore di elaborazione. Se pensi che sia un errore, invia il report al supporto.",
    paymentInitPublicMessage:
      "Non siamo riusciti ad avviare il pagamento. Se sembra un errore, invia il report al supporto.",
    paymentFlowPublicMessage:
      "Non siamo riusciti a completare il pagamento o la fattura. Se sembra un errore, invia il report al supporto.",
    pdfEmailFailedPublicMessage:
      "Non e stato possibile inviare il PDF e il pagamento non verra finalizzato. Se sembra un errore, invia il report al supporto.",
    transactionWarning:
      "Il pagamento potrebbe essere gia stato elaborato. Non ripetere subito l'acquisto.",
    reportPrompt:
      "Se pensi che sia un errore, tocca \"Invia report\" e prepareremo un'email con i dettagli tecnici.",
    referenceLabel: "Codice errore",
    transactionIdLabel: "ID transazione",
    closeButton: "Chiudi",
    sendButton: "Invia report",
    emailUnavailableTitle: "Impossibile aprire l'app email",
    emailUnavailableMessage:
      "Invia manualmente un'email a webdynamicx@gmail.com e includi questo codice di riferimento.",
    purchaseSupportMessage:
      "Se hai problemi con gli acquisti, scrivi a webdynamicx@gmail.com per ricevere supporto.",
  },
  pl: {
    ...ENGLISH_COPY,
    alertTitle: "Wystapil problem",
    genericMessage:
      "Wystapil blad przetwarzania. Jesli uwazasz, ze to pomylka, wyslij raport do wsparcia.",
    paymentInitPublicMessage:
      "Nie udalo sie zainicjowac platnosci. Jesli to wyglada na blad, wyslij raport do wsparcia.",
    paymentFlowPublicMessage:
      "Nie udalo sie dokonczyc platnosci lub faktury. Jesli to wyglada na blad, wyslij raport do wsparcia.",
    pdfEmailFailedPublicMessage:
      "Nie udalo sie wyslac PDF-a i platnosc nie zostanie sfinalizowana. Jesli to wyglada na blad, wyslij raport do wsparcia.",
    transactionWarning:
      "Platnosc mogla juz zostac przetworzona. Nie ponawiaj zakupu od razu.",
    reportPrompt:
      "Jesli uwazasz, ze to pomylka, kliknij \"Wyslij raport\", a przygotujemy email z danymi technicznymi.",
    referenceLabel: "Kod bledu",
    transactionIdLabel: "ID transakcji",
    closeButton: "Zamknij",
    sendButton: "Wyslij raport",
    emailUnavailableTitle: "Nie udalo sie otworzyc aplikacji email",
    emailUnavailableMessage:
      "Wyslij email recznie na webdynamicx@gmail.com i dolacz ten kod referencyjny.",
    purchaseSupportMessage:
      "Jesli masz problemy z zakupami, napisz na webdynamicx@gmail.com, aby uzyskac pomoc.",
  },
  bg: {
    ...ENGLISH_COPY,
    alertTitle: "Възникна проблем",
    genericMessage:
      "Възникна грешка при обработката. Ако смятате, че това е грешка, изпратете доклада до поддръжката.",
    paymentInitPublicMessage:
      "Не успяхме да инициализираме плащането. Ако това изглежда като грешка, изпратете доклада до поддръжката.",
    paymentFlowPublicMessage:
      "Не успяхме да завършим плащането или фактурата. Ако това изглежда като грешка, изпратете доклада до поддръжката.",
    pdfEmailFailedPublicMessage:
      "PDF файлът не можа да бъде изпратен и плащането няма да бъде финализирано. Ако това изглежда като грешка, изпратете доклада до поддръжката.",
    transactionWarning:
      "Плащането може вече да е обработено. Не повтаряйте покупката веднага.",
    reportPrompt:
      "Ако смятате, че това е грешка, натиснете \"Изпрати доклад\" и ще подготвим имейл с техническите детайли.",
    referenceLabel: "Код на грешката",
    transactionIdLabel: "ID на транзакцията",
    closeButton: "Затвори",
    sendButton: "Изпрати доклад",
    emailUnavailableTitle: "Не успяхме да отворим имейл приложението",
    emailUnavailableMessage:
      "Изпратете имейл ръчно до webdynamicx@gmail.com и включете този референтен код.",
    purchaseSupportMessage:
      "Ако имате проблеми с покупките, пишете на webdynamicx@gmail.com за поддръжка.",
  },
  cs: {
    ...ENGLISH_COPY,
    alertTitle: "Doslo k problemu",
    genericMessage:
      "Doslo ke chybe pri zpracovani. Pokud si myslite, ze jde o omyl, odeslete report podpore.",
    paymentInitPublicMessage:
      "Nepodarilo se inicializovat platbu. Pokud to vypada jako chyba, odeslete report podpore.",
    paymentFlowPublicMessage:
      "Nepodarilo se dokoncit platbu nebo fakturu. Pokud to vypada jako chyba, odeslete report podpore.",
    pdfEmailFailedPublicMessage:
      "PDF se nepodarilo odeslat a platba nebude dokoncena. Pokud to vypada jako chyba, odeslete report podpore.",
    transactionWarning:
      "Platba uz mohla byt zpracovana. Neopakujte nakup ihned.",
    reportPrompt:
      "Pokud si myslite, ze jde o omyl, klepnete na \"Odeslat report\" a pripravime email s technickymi detaily.",
    referenceLabel: "Kod chyby",
    transactionIdLabel: "ID transakce",
    closeButton: "Zavrit",
    sendButton: "Odeslat report",
    emailUnavailableTitle: "Nepodarilo se otevrit emailovou aplikaci",
    emailUnavailableMessage:
      "Poslete email rucne na webdynamicx@gmail.com a pripojte tento referencni kod.",
    purchaseSupportMessage:
      "Pokud mate problemy s nakupy, napiste na webdynamicx@gmail.com pro podporu.",
  },
  de: {
    ...ENGLISH_COPY,
    alertTitle: "Ein Problem ist aufgetreten",
    genericMessage:
      "Bei der Verarbeitung ist ein Fehler aufgetreten. Wenn Sie denken, dass dies ein Irrtum ist, senden Sie den Bericht an den Support.",
    paymentInitPublicMessage:
      "Wir konnten die Zahlung nicht initialisieren. Wenn das falsch erscheint, senden Sie den Bericht an den Support.",
    paymentFlowPublicMessage:
      "Wir konnten die Zahlung oder Rechnung nicht abschliessen. Wenn das falsch erscheint, senden Sie den Bericht an den Support.",
    pdfEmailFailedPublicMessage:
      "Das PDF konnte nicht gesendet werden und die Zahlung wird nicht abgeschlossen. Wenn das falsch erscheint, senden Sie den Bericht an den Support.",
    transactionWarning:
      "Die Zahlung wurde moglicherweise bereits verarbeitet. Wiederholen Sie den Kauf nicht sofort.",
    reportPrompt:
      "Wenn Sie denken, dass dies ein Irrtum ist, tippen Sie auf \"Bericht senden\" und wir bereiten eine Email mit technischen Details vor.",
    referenceLabel: "Fehlercode",
    transactionIdLabel: "Transaktions-ID",
    closeButton: "Schliessen",
    sendButton: "Bericht senden",
    emailUnavailableTitle: "Die Email-App konnte nicht geoffnet werden",
    emailUnavailableMessage:
      "Bitte senden Sie manuell eine Email an webdynamicx@gmail.com und geben Sie diesen Referenzcode an.",
    purchaseSupportMessage:
      "Wenn Sie Probleme mit Einkaufen haben, schreiben Sie an webdynamicx@gmail.com fur Support.",
  },
  el: {
    ...ENGLISH_COPY,
    alertTitle: "Παρουσιάστηκε πρόβλημα",
    genericMessage:
      "Παρουσιάστηκε σφάλμα επεξεργασίας. Αν πιστεύετε ότι πρόκειται για λάθος, στείλτε την αναφορά στην υποστήριξη.",
    paymentInitPublicMessage:
      "Δεν μπορέσαμε να ξεκινήσουμε την πληρωμή. Αν αυτό φαίνεται λάθος, στείλτε την αναφορά στην υποστήριξη.",
    paymentFlowPublicMessage:
      "Δεν μπορέσαμε να ολοκληρώσουμε την πληρωμή ή το τιμολόγιο. Αν αυτό φαίνεται λάθος, στείλτε την αναφορά στην υποστήριξη.",
    pdfEmailFailedPublicMessage:
      "Δεν ήταν δυνατή η αποστολή του PDF και η πληρωμή δεν θα ολοκληρωθεί. Αν αυτό φαίνεται λάθος, στείλτε την αναφορά στην υποστήριξη.",
    transactionWarning:
      "Η πληρωμή μπορεί να έχει ήδη επεξεργαστεί. Μην επαναλάβετε αμέσως την αγορά.",
    reportPrompt:
      "Αν πιστεύετε ότι πρόκειται για λάθος, πατήστε \"Αποστολή αναφοράς\" και θα ετοιμάσουμε email με τεχνικές λεπτομέρειες.",
    referenceLabel: "Κωδικός σφάλματος",
    transactionIdLabel: "ID συναλλαγής",
    closeButton: "Κλείσιμο",
    sendButton: "Αποστολή αναφοράς",
    emailUnavailableTitle: "Δεν ήταν δυνατό το άνοιγμα της εφαρμογής email",
    emailUnavailableMessage:
      "Στείλτε χειροκίνητα email στο webdynamicx@gmail.com και συμπεριλάβετε αυτόν τον κωδικό αναφοράς.",
    purchaseSupportMessage:
      "Αν έχετε προβλήματα με τις αγορές, στείλτε email στο webdynamicx@gmail.com για υποστήριξη.",
  },
  fr: {
    ...ENGLISH_COPY,
    alertTitle: "Un probleme est survenu",
    genericMessage:
      "Une erreur de traitement s'est produite. Si vous pensez qu'il s'agit d'une erreur, envoyez le rapport au support.",
    paymentInitPublicMessage:
      "Nous n'avons pas pu initialiser le paiement. Si cela semble incorrect, envoyez le rapport au support.",
    paymentFlowPublicMessage:
      "Nous n'avons pas pu finaliser le paiement ou la facture. Si cela semble incorrect, envoyez le rapport au support.",
    pdfEmailFailedPublicMessage:
      "Le PDF n'a pas pu etre envoye et le paiement ne sera pas finalise. Si cela semble incorrect, envoyez le rapport au support.",
    transactionWarning:
      "Le paiement a peut-etre deja ete traite. Ne relancez pas l'achat immediatement.",
    reportPrompt:
      "Si vous pensez qu'il s'agit d'une erreur, appuyez sur \"Envoyer le rapport\" et nous preparerons un email avec les details techniques.",
    referenceLabel: "Code d'erreur",
    transactionIdLabel: "ID de transaction",
    closeButton: "Fermer",
    sendButton: "Envoyer le rapport",
    emailUnavailableTitle: "Impossible d'ouvrir l'application email",
    emailUnavailableMessage:
      "Veuillez envoyer un email manuellement a webdynamicx@gmail.com et inclure ce code de reference.",
    purchaseSupportMessage:
      "Si vous avez des problemes avec les achats, ecrivez a webdynamicx@gmail.com pour obtenir de l'aide.",
  },
  hi: {
    ...ENGLISH_COPY,
    alertTitle: "एक समस्या हुई",
    genericMessage:
      "प्रोसेसिंग में त्रुटि हुई। यदि आपको लगता है कि यह गलती है, तो रिपोर्ट सपोर्ट को भेजें।",
    paymentInitPublicMessage:
      "हम भुगतान शुरू नहीं कर सके। यदि यह गलत लगता है, तो रिपोर्ट सपोर्ट को भेजें।",
    paymentFlowPublicMessage:
      "हम भुगतान या इनवॉइस पूरा नहीं कर सके। यदि यह गलत लगता है, तो रिपोर्ट सपोर्ट को भेजें।",
    pdfEmailFailedPublicMessage:
      "PDF भेजा नहीं जा सका और भुगतान पूरा नहीं किया जाएगा। यदि यह गलत लगता है, तो रिपोर्ट सपोर्ट को भेजें।",
    transactionWarning:
      "भुगतान शायद पहले ही प्रोसेस हो चुका है। खरीद को तुरंत दोबारा न करें।",
    reportPrompt:
      "यदि आपको लगता है कि यह गलती है, तो \"रिपोर्ट भेजें\" दबाएं और हम तकनीकी विवरण वाला ईमेल तैयार करेंगे।",
    referenceLabel: "त्रुटि कोड",
    transactionIdLabel: "लेन-देन आईडी",
    closeButton: "बंद करें",
    sendButton: "रिपोर्ट भेजें",
    emailUnavailableTitle: "ईमेल ऐप नहीं खुल सकी",
    emailUnavailableMessage:
      "कृपया webdynamicx@gmail.com पर मैन्युअल ईमेल भेजें और यह रेफरेंस कोड शामिल करें।",
    purchaseSupportMessage:
      "यदि आपको खरीदारी में समस्या हो, तो सहायता के लिए webdynamicx@gmail.com पर ईमेल करें।",
  },
  id: {
    ...ENGLISH_COPY,
    alertTitle: "Terjadi masalah",
    genericMessage:
      "Terjadi kesalahan pemrosesan. Jika menurut Anda ini kesalahan, kirim laporan ke dukungan.",
    paymentInitPublicMessage:
      "Kami tidak dapat memulai pembayaran. Jika ini tampak salah, kirim laporan ke dukungan.",
    paymentFlowPublicMessage:
      "Kami tidak dapat menyelesaikan pembayaran atau invoice. Jika ini tampak salah, kirim laporan ke dukungan.",
    pdfEmailFailedPublicMessage:
      "PDF tidak dapat dikirim dan pembayaran tidak akan diselesaikan. Jika ini tampak salah, kirim laporan ke dukungan.",
    transactionWarning:
      "Pembayaran mungkin sudah diproses. Jangan ulangi pembelian segera.",
    reportPrompt:
      "Jika menurut Anda ini kesalahan, ketuk \"Kirim laporan\" dan kami akan menyiapkan email dengan detail teknis.",
    referenceLabel: "Kode error",
    transactionIdLabel: "ID transaksi",
    closeButton: "Tutup",
    sendButton: "Kirim laporan",
    emailUnavailableTitle: "Aplikasi email tidak dapat dibuka",
    emailUnavailableMessage:
      "Silakan kirim email manual ke webdynamicx@gmail.com dan sertakan kode referensi ini.",
    purchaseSupportMessage:
      "Jika Anda mengalami masalah dengan pembelian, kirim email ke webdynamicx@gmail.com untuk dukungan.",
  },
  sk: {
    ...ENGLISH_COPY,
    alertTitle: "Vyskytol sa problem",
    genericMessage:
      "Pri spracovani doslo k chybe. Ak si myslite, ze ide o omyl, poslite report podpore.",
    paymentInitPublicMessage:
      "Platbu sa nepodarilo inicializovat. Ak to vyzera ako chyba, poslite report podpore.",
    paymentFlowPublicMessage:
      "Nepodarilo sa dokoncit platbu alebo fakturu. Ak to vyzera ako chyba, poslite report podpore.",
    pdfEmailFailedPublicMessage:
      "PDF sa nepodarilo odoslat a platba nebude dokoncena. Ak to vyzera ako chyba, poslite report podpore.",
    transactionWarning:
      "Platba uz mohla byt spracovana. Neopakujte nakup hned.",
    reportPrompt:
      "Ak si myslite, ze ide o omyl, klepnite na \"Odoslat report\" a pripravime email s technickymi detailmi.",
    referenceLabel: "Kod chyby",
    transactionIdLabel: "ID transakcie",
    closeButton: "Zavriet",
    sendButton: "Odoslat report",
    emailUnavailableTitle: "Nepodarilo sa otvorit emailovu aplikaciu",
    emailUnavailableMessage:
      "Poslite email rucne na webdynamicx@gmail.com a prilozte tento referencny kod.",
    purchaseSupportMessage:
      "Ak mate problemy s nakupmi, napiste na webdynamicx@gmail.com pre podporu.",
  },
  ru: {
    ...ENGLISH_COPY,
    alertTitle: "Возникла проблема",
    genericMessage:
      "Произошла ошибка обработки. Если вы считаете, что это ошибка, отправьте отчет в поддержку.",
    paymentInitPublicMessage:
      "Не удалось инициализировать платеж. Если это выглядит как ошибка, отправьте отчет в поддержку.",
    paymentFlowPublicMessage:
      "Не удалось завершить платеж или счет. Если это выглядит как ошибка, отправьте отчет в поддержку.",
    pdfEmailFailedPublicMessage:
      "Не удалось отправить PDF, и платеж не будет завершен. Если это выглядит как ошибка, отправьте отчет в поддержку.",
    transactionWarning:
      "Платеж, возможно, уже обработан. Не повторяйте покупку сразу.",
    reportPrompt:
      "Если вы считаете, что это ошибка, нажмите \"Отправить отчет\", и мы подготовим email с техническими деталями.",
    referenceLabel: "Код ошибки",
    transactionIdLabel: "ID транзакции",
    closeButton: "Закрыть",
    sendButton: "Отправить отчет",
    emailUnavailableTitle: "Не удалось открыть почтовое приложение",
    emailUnavailableMessage:
      "Отправьте письмо вручную на webdynamicx@gmail.com и добавьте этот код ссылки.",
    purchaseSupportMessage:
      "Если у вас возникли проблемы с покупками, напишите на webdynamicx@gmail.com для поддержки.",
  },
  tr: {
    ...ENGLISH_COPY,
    alertTitle: "Bir sorun olustu",
    genericMessage:
      "Islem sirasinda bir hata olustu. Bunun bir hata oldugunu dusunuyorsaniz raporu destege gonderin.",
    paymentInitPublicMessage:
      "Odeme baslatilamadi. Bu yanlis gorunuyorsa raporu destege gonderin.",
    paymentFlowPublicMessage:
      "Odeme veya fatura tamamlanamadi. Bu yanlis gorunuyorsa raporu destege gonderin.",
    pdfEmailFailedPublicMessage:
      "PDF gonderilemedi ve odeme tamamlanmayacak. Bu yanlis gorunuyorsa raporu destege gonderin.",
    transactionWarning:
      "Odeme zaten islenmis olabilir. Satin alimi hemen tekrar etmeyin.",
    reportPrompt:
      "Bunun bir hata oldugunu dusunuyorsaniz \"Rapor gonder\"e dokunun; teknik ayrintilari iceren bir email hazirlanacaktir.",
    referenceLabel: "Hata kodu",
    transactionIdLabel: "Islem kimligi",
    closeButton: "Kapat",
    sendButton: "Rapor gonder",
    emailUnavailableTitle: "Email uygulamasi acilamadi",
    emailUnavailableMessage:
      "Lutfen webdynamicx@gmail.com adresine manuel bir email gonderin ve bu referans kodunu ekleyin.",
    purchaseSupportMessage:
      "Satin alimlarla ilgili sorun yasarsaniz destek icin webdynamicx@gmail.com adresine yazin.",
  },
};

const normalizeLanguageCode = (language) =>
  String(language || DEFAULT_LANGUAGE)
    .trim()
    .toLowerCase()
    .split("-")[0];

const getLocalizedCopy = (language) => {
  const normalizedLanguage = normalizeLanguageCode(language);
  return {
    ...ENGLISH_COPY,
    ...(LOCALIZED_COPY[normalizedLanguage] || LOCALIZED_COPY.en),
  };
};

export const getLocalizedSupportCopy = (language) => getLocalizedCopy(language);

const appendSupportMessage = (message, copy) => {
  const baseMessage = String(message || "").trim();
  const supportMessage = String(copy?.purchaseSupportMessage || "").trim();

  if (!supportMessage) {
    return baseMessage;
  }

  if (
    baseMessage.includes(supportMessage) ||
    baseMessage.toLowerCase().includes(SUPPORT_EMAIL.toLowerCase())
  ) {
    return baseMessage;
  }

  if (!baseMessage) {
    return supportMessage;
  }

  return `${baseMessage}\n\n${supportMessage}`;
};

export const appendPurchaseSupportMessage = (
  message,
  language = DEFAULT_LANGUAGE
) => appendSupportMessage(message, getLocalizedCopy(language));

const trimValue = (value, maxLength = MAX_FIELD_LENGTH) => {
  const normalized = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) {
    return "";
  }
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 1)}...`;
};

const buildErrorReference = (screenName) => {
  const prefix = trimValue(screenName, 16)
    .replace(/[^a-zA-Z0-9]+/g, "")
    .toUpperCase()
    .slice(0, 10) || "APP";
  const timePart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${timePart}-${randomPart}`;
};

const extractErrorMessage = (error, fallbackTechnicalMessage) => {
  if (
    typeof fallbackTechnicalMessage === "string" &&
    fallbackTechnicalMessage.trim()
  ) {
    return trimValue(fallbackTechnicalMessage, 300);
  }

  const maybeMessage =
    error?.message ||
    error?.localizedMessage ||
    error?.details?.message ||
    error?.error?.message ||
    "";

  return trimValue(maybeMessage, 300);
};

const extractErrorCode = (error) => {
  const maybeCode =
    error?.code ||
    error?.errorCode ||
    error?.details?.code ||
    error?.status ||
    error?.type ||
    "";

  return trimValue(maybeCode, 80);
};

const getAppVersion = () =>
  trimValue(
    Constants.expoConfig?.version ||
      Constants.manifest2?.extra?.expoClient?.version ||
      Constants.manifest?.version ||
      "unknown",
    80
  );

const buildSupportEmailBody = ({
  copy,
  errorRef,
  screenName,
  transactionId,
  errorCode,
  errorMessage,
  productCode,
  analysisId,
  analysisType,
  contactEmail,
  contactPhone,
  fullName,
  language,
  extraContext,
}) => {
  const lines = [
    copy.emailGreeting,
    "",
    copy.emailIntro,
    "",
    `${copy.emailDescribePrompt}`,
    "- ",
    "",
    `${copy.userHeader}:`,
    `- ${copy.fullNameLabel}: ${trimValue(fullName) || "-"}`,
    `- ${copy.emailLabel}: ${trimValue(contactEmail) || "-"}`,
    `- ${copy.phoneLabel}: ${trimValue(contactPhone) || "-"}`,
    "",
    `${copy.emailDetailsHeader}:`,
    `- ${copy.referenceLabel}: ${errorRef}`,
    `- ${copy.screenLabel}: ${trimValue(screenName) || "-"}`,
    `- ${copy.transactionIdLabel}: ${trimValue(transactionId) || "-"}`,
    `- ${copy.productCodeLabel}: ${trimValue(productCode) || "-"}`,
    `- ${copy.analysisIdLabel}: ${trimValue(analysisId) || "-"}`,
    `- ${copy.analysisTypeLabel}: ${trimValue(analysisType) || "-"}`,
    `- ${copy.errorCodeLabel}: ${trimValue(errorCode) || "-"}`,
    `- ${copy.messageLabel}: ${trimValue(errorMessage, 320) || "-"}`,
    `- ${copy.languageLabel}: ${normalizeLanguageCode(language) || "-"}`,
    `- ${copy.platformLabel}: ${trimValue(Platform.OS)} ${trimValue(
      Platform.Version,
      32
    )}`,
    `- ${copy.appVersionLabel}: ${getAppVersion()}`,
    `- ${copy.timeLabel}: ${new Date().toISOString()}`,
  ];

  const extraContextString = trimValue(
    extraContext ? JSON.stringify(extraContext) : "",
    MAX_EXTRA_CONTEXT_LENGTH
  );

  if (extraContextString) {
    lines.push(`- ${copy.extraContextLabel}: ${extraContextString}`);
  }

  return lines.join("\n");
};

const openSupportEmailDraft = async ({
  copy,
  errorRef,
  screenName,
  transactionId,
  errorCode,
  errorMessage,
  productCode,
  analysisId,
  analysisType,
  contactEmail,
  contactPhone,
  fullName,
  language,
  extraContext,
}) => {
  const subject = `${copy.emailSubjectPrefix}: ${errorRef}`;
  const body = buildSupportEmailBody({
    copy,
    errorRef,
    screenName,
    transactionId,
    errorCode,
    errorMessage,
    productCode,
    analysisId,
    analysisType,
    contactEmail,
    contactPhone,
    fullName,
    language,
    extraContext,
  });
  const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  try {
    await Linking.openURL(mailtoUrl);
  } catch (openError) {
    Alert.alert(
      copy.emailUnavailableTitle,
      `${copy.emailUnavailableMessage}\n\n${copy.referenceLabel}: ${errorRef}`
    );
  }
};

export const showLocalizedSupportErrorAlert = ({
  language = DEFAULT_LANGUAGE,
  screenName = "App",
  title,
  publicMessage = "",
  technicalMessage = "",
  error,
  transactionId = "",
  productCode = "",
  analysisId = "",
  analysisType = "",
  contactEmail = "",
  contactPhone = "",
  fullName = "",
  extraContext = null,
  showTransactionRetryWarning = false,
} = {}) => {
  const copy = getLocalizedCopy(language);
  const errorRef = buildErrorReference(screenName);
  const technicalErrorMessage =
    extractErrorMessage(error, technicalMessage) || copy.genericMessage;
  const publicAlertMessage = trimValue(publicMessage, 320);
  const alertMessage = appendSupportMessage(
    publicAlertMessage || technicalErrorMessage,
    copy
  );
  const errorCode = extractErrorCode(error);

  console.error("[SUPPORT_ERROR_ALERT]", {
    errorRef,
    screenName,
    transactionId: trimValue(transactionId, 120),
    errorCode,
    alertMessage,
    technicalErrorMessage,
    productCode: trimValue(productCode, 80),
    analysisId: trimValue(analysisId, 80),
    analysisType: trimValue(analysisType, 80),
    contactEmail: trimValue(contactEmail, 120),
    contactPhone: trimValue(contactPhone, 40),
    extraContext,
  });

  const alertLines = [alertMessage];

  if (showTransactionRetryWarning && trimValue(transactionId)) {
    alertLines.push(copy.transactionWarning);
  }

  alertLines.push(copy.reportPrompt);
  alertLines.push(`${copy.referenceLabel}: ${errorRef}`);

  if (trimValue(transactionId)) {
    alertLines.push(
      `${copy.transactionIdLabel}: ${trimValue(transactionId, 120)}`
    );
  }

  Alert.alert(title || copy.alertTitle, alertLines.join("\n\n"), [
    {
      text: copy.closeButton,
      style: "cancel",
    },
    {
      text: copy.sendButton,
      onPress: () =>
        openSupportEmailDraft({
          copy,
          errorRef,
          screenName,
          transactionId,
          errorCode,
          errorMessage: technicalErrorMessage,
          productCode,
          analysisId,
          analysisType,
          contactEmail,
          contactPhone,
          fullName,
          language,
          extraContext,
        }),
    },
  ]);

  return errorRef;
};
