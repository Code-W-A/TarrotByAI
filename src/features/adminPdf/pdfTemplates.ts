type GenericObject = Record<string, any>;
type TemplateLocale = "ro" | "en";

const resolveTemplateLocale = (language?: string): TemplateLocale => {
  const normalized = String(language || "")
    .trim()
    .toLowerCase();
  if (normalized.startsWith("ro")) {
    return "ro";
  }
  return "en";
};

const ASTRO_TEMPLATE_LABELS: Record<
  TemplateLocale,
  {
    reportTitle: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    natalChartTitle: string;
    noChart: string;
    signSection: string;
    houseSection: string;
  }
> = {
  ro: {
    reportTitle: "Interpretare Astrograma",
    birthDate: "Data nasterii",
    birthTime: "Ora nasterii",
    birthPlace: "Locul nasterii",
    natalChartTitle: "Astrograma Natala",
    noChart: "Astrograma natala nu este disponibila.",
    signSection: "General Sign Report",
    houseSection: "General House Report",
  },
  en: {
    reportTitle: "Natal Chart Interpretation",
    birthDate: "Birth date",
    birthTime: "Birth time",
    birthPlace: "Birth place",
    natalChartTitle: "Natal Chart",
    noChart: "Natal chart is not available.",
    signSection: "General Sign Report",
    houseSection: "General House Report",
  },
};

const renderNoDataHtml = (title: string, message: string): string => {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; line-height: 1.6; }
          h1 { color: #4CAF50; text-align: center; }
          p { color: #333; text-align: center; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>${message}</p>
      </body>
    </html>
  `;
};

const safeObjectKeys = (value: unknown): string[] => {
  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.keys(value as GenericObject);
};

const formatHourMinute = (person: GenericObject): string => {
  if (person?.selectedTime) {
    return String(person.selectedTime);
  }

  if (person?.timeOfBirth) {
    return String(person.timeOfBirth);
  }

  if (typeof person?.hour !== "undefined" && typeof person?.min !== "undefined") {
    return `${person.hour}:${person.min}`;
  }

  return "";
};

const formatBirthDate = (person: GenericObject): string => {
  if (!person) {
    return "";
  }

  if (
    typeof person.day !== "undefined" &&
    typeof person.month !== "undefined" &&
    typeof person.year !== "undefined"
  ) {
    return `${person.day}-${person.month}-${person.year}`;
  }

  return "";
};

const buildWheelImageSrc = (base64Image?: string): string => {
  if (!base64Image) {
    return "";
  }

  if (base64Image.startsWith("data:image")) {
    return base64Image;
  }

  return `data:image/svg+xml;base64,${base64Image}`;
};

export const buildAstrologyPdfHtml = (
  analysis: GenericObject,
  language?: string
): string => {
  if (!analysis) {
    return renderNoDataHtml(
      "Interpretare Astrograma",
      "Nu exista date suficiente pentru generarea PDF-ului."
    );
  }

  const locale = resolveTemplateLocale(language);
  const labels = ASTRO_TEMPLATE_LABELS[locale];
  const natalWheelChart = analysis?.natalData?.data?.svg;
  const generalSignTextData = analysis?.generalSignTextData || {};
  const generalHouseTextData = analysis?.generalHouseTextData || {};

  const generateSignSections = () => {
    return safeObjectKeys(generalSignTextData)
      .map((key) => {
        const planetData = generalSignTextData?.[key]?.data || {};
        const title =
          planetData?.title ||
          `${planetData?.planet_name || ""} is in ${planetData?.sign_name || ""}`;

        return `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #4CAF50; margin-top: 20px;">
              ${title}
            </h3>
            <p style="color: #333;">
              ${planetData?.report || ""}
            </p>
          </div>
        `;
      })
      .join("");
  };

  const generateHouseSections = () => {
    return safeObjectKeys(generalHouseTextData)
      .map((key) => {
        const houseData = generalHouseTextData?.[key]?.data || {};
        const title =
          houseData?.title ||
          `${houseData?.planet_name || ""} is in the ${houseData?.house || ""}th house`;

        return `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #4CAF50; margin-top: 20px;">
              ${title}
            </h3>
            <p style="color: #333;">
              ${houseData?.report || ""}
            </p>
          </div>
        `;
      })
      .join("");
  };

  return `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          line-height: 1.6;
        }
        h1, h2 {
          text-align: center;
          color: #4CAF50;
        }
        p {
          margin-bottom: 10px;
        }
        .chart-container {
          text-align: center;
          margin: 20px 0;
        }
        .chart-container img, .chart-container svg {
          max-width: 100%;
          height: auto;
        }
      </style>
    </head>
    <body>
      <h1>${labels.reportTitle}</h1>
      <h2>${analysis?.full_name || "Nume indisponibil"}</h2>
      <p>${labels.birthDate}: ${formatBirthDate(analysis)}</p>
      <p>${labels.birthTime}: ${formatHourMinute(analysis)}</p>
      <p>${labels.birthPlace}: ${analysis?.place || ""}</p>

      <div class="chart-container">
        <h2>${labels.natalChartTitle}</h2>
        ${
          natalWheelChart
            ? natalWheelChart
            : `<p>${labels.noChart}</p>`
        }
      </div>

      <div>
        <h2 style="margin-top: 40px; color: #4CAF50;">${labels.signSection}</h2>
        ${generateSignSections()}
      </div>

      <div>
        <h2 style="margin-top: 40px; color: #4CAF50;">${labels.houseSection}</h2>
        ${generateHouseSections()}
      </div>
    </body>
  </html>
`;
};

type SynastryCategory = {
  key: string;
  titleRo: string;
  titleEn: string;
};

const SYNasTRY_CATEGORIES: SynastryCategory[] = [
  {
    key: "harmoniousAspectReading",
    titleRo: "Aspecte Armonioase",
    titleEn: "Harmonious Aspects",
  },
  {
    key: "conflictingAspectReading",
    titleRo: "Aspecte Conflictuale",
    titleEn: "Conflicting Aspects",
  },
  {
    key: "contrastingAspectReading",
    titleRo: "Aspecte Contrastante",
    titleEn: "Contrasting Aspects",
  },
  {
    key: "intenseCompatibility",
    titleRo: "Aspecte Intense",
    titleEn: "Intense Aspects",
  },
  {
    key: "physicalCompatibility",
    titleRo: "Compatibilitate Fizica",
    titleEn: "Physical Compatibility",
  },
  {
    key: "emotionalCompatibility",
    titleRo: "Compatibilitate Emotionala",
    titleEn: "Emotional Compatibility",
  },
  {
    key: "sexualCompatibility",
    titleRo: "Compatibilitate Sexuala",
    titleEn: "Sexual Compatibility",
  },
  {
    key: "spiritualCompatibility",
    titleRo: "Compatibilitate Spirituala",
    titleEn: "Spiritual Compatibility",
  },
  {
    key: "financialCompatibility",
    titleRo: "Compatibilitate Financiara",
    titleEn: "Financial Compatibility",
  },
];

const SYNASTRY_TEMPLATE_LABELS: Record<
  TemplateLocale,
  {
    reportTitle: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    gender: string;
    personOneFallback: string;
    personTwoFallback: string;
    noChart: string;
  }
> = {
  ro: {
    reportTitle: "Raport de Compatibilitate",
    birthDate: "Data nasterii",
    birthTime: "Ora nasterii",
    birthPlace: "Locul nasterii",
    gender: "Gen",
    personOneFallback: "Nume persoana 1",
    personTwoFallback: "Nume persoana 2",
    noChart: "Astrograma natala nu este disponibila.",
  },
  en: {
    reportTitle: "Compatibility Report",
    birthDate: "Birth date",
    birthTime: "Birth time",
    birthPlace: "Birth place",
    gender: "Gender",
    personOneFallback: "Person 1 name",
    personTwoFallback: "Person 2 name",
    noChart: "Natal chart is not available.",
  },
};

export const buildSynastryPdfHtml = (
  analysis: GenericObject,
  language?: string
): string => {
  if (!analysis?.synastry) {
    return renderNoDataHtml(
      "Raport de Compatibilitate",
      "Nu exista date suficiente pentru generarea PDF-ului."
    );
  }

  const locale = resolveTemplateLocale(language);
  const labels = SYNASTRY_TEMPLATE_LABELS[locale];
  const personOne = analysis.person1 || analysis.p1 || {};
  const personTwo = analysis.person2 || analysis.p2 || {};
  const synastry = analysis.synastry || {};
  const wheelChartP1 = buildWheelImageSrc(
    synastry?.natalWheelChart?.data?.p1?.base64_image
  );
  const wheelChartP2 = buildWheelImageSrc(
    synastry?.natalWheelChart?.data?.p2?.base64_image
  );

  const sections = SYNasTRY_CATEGORIES.map((category) => {
    const entries = synastry?.[category.key]?.data;
    if (!Array.isArray(entries) || entries.length === 0) {
      return "";
    }

    const sectionContent = entries
      .map((item: GenericObject) => {
        const readings = Array.isArray(item?.reading) ? item.reading : [];
        if (!readings.length) {
          return "";
        }

        return readings
          .map(
            (reading: GenericObject) => `
              <div class="aspect">
                <h3>${reading?.title || "Titlu indisponibil"}</h3>
                <p>${reading?.description || "Descriere indisponibila"}</p>
              </div>
            `
          )
          .join("");
      })
      .join("");

    if (!sectionContent) {
      return "";
    }

    return `
      <div class="section">
        <h1>${locale === "ro" ? category.titleRo : category.titleEn}</h1>
        ${sectionContent}
      </div>
    `;
  }).join("");

  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            padding: 20px;
          }
          h1, h2, h3, h4 {
            color: #4CAF50;
            text-align: center;
          }
          .section {
            margin: 20px 0;
          }
          .aspect {
            margin: 10px 0;
          }
          img {
            display: block;
            margin: 20px auto;
            border: 1px solid #ddd;
            border-radius: 10px;
            max-width: 300px;
          }
        </style>
      </head>
      <body>
        <h1>${labels.reportTitle}</h1>
        <div class="person-info">
          <div class="person">
            <h3>${personOne?.full_name || labels.personOneFallback}</h3>
            <p>${labels.birthDate}: ${formatBirthDate(personOne)}</p>
            <p>${labels.birthTime}: ${formatHourMinute(personOne)}</p>
            <p>${labels.birthPlace}: ${personOne?.place || ""}</p>
            <p>${labels.gender}: ${personOne?.gender || ""}</p>
            ${
              wheelChartP1
                ? `<img src="${wheelChartP1}" alt="Astrograma Natala - P1" />`
                : `<p>${labels.noChart}</p>`
            }
          </div>
          <div class="person">
            <h3>${personTwo?.full_name || labels.personTwoFallback}</h3>
            <p>${labels.birthDate}: ${formatBirthDate(personTwo)}</p>
            <p>${labels.birthTime}: ${formatHourMinute(personTwo)}</p>
            <p>${labels.birthPlace}: ${personTwo?.place || ""}</p>
            <p>${labels.gender}: ${personTwo?.gender || ""}</p>
            ${
              wheelChartP2
                ? `<img src="${wheelChartP2}" alt="Astrograma Natala - P2" />`
                : `<p>${labels.noChart}</p>`
            }
          </div>
        </div>
        ${sections}
      </body>
    </html>
  `;
};
