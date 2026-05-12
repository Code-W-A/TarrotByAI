import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { languages } from "../../utils/LanguageUtils";
import {
  getAuthEmailForAdminCheck,
  isAdminEmail,
} from "../../features/adminPdf/adminAccess";
import {
  buildManualAstrologyAnalysis,
  buildManualSynastryAnalysis,
  getAstrologySavedOptions,
  getSynastrySavedOptions,
  loadAdminSavedData,
  translateAstrologyAnalysis,
  translateSynastryAnalysis,
} from "../../features/adminPdf/adminPdfData";
import {
  buildAstrologyPdfHtml,
  buildSynastryPdfHtml,
} from "../../features/adminPdf/pdfTemplates";
import {
  generateLocalPdfAndShare,
  sendPdfByEmail,
} from "../../features/adminPdf/pdfActions";

type GenericObject = Record<string, any>;
type DataSource = "saved" | "manual";
type AnalysisType = "astrology" | "synastry";

type ManualPersonState = {
  full_name: string;
  day: string;
  month: string;
  year: string;
  selectedTime: string;
  gender: string;
  place: string;
  adress: string;
  lat: string;
  lon: string;
};

type SavedOption = {
  id: string;
  label: string;
  emailPrefill: string;
  analysis: GenericObject;
  sourceType: "saved";
};

const GOOGLE_PLACES_API_KEY = "AIzaSyBRgP4D08BVgzw4oyWfZZ9Rx2mjNouePj4";
const GOOGLE_PLACES_QUERY = Object.freeze({
  key: GOOGLE_PLACES_API_KEY,
  language: "en",
});

const initialPersonState = (): ManualPersonState => ({
  full_name: "",
  day: "",
  month: "",
  year: "",
  selectedTime: "",
  gender: "male",
  place: "",
  adress: "",
  lat: "",
  lon: "",
});

const normalizeLanguageCode = (value?: string) => {
  if (!value || typeof value !== "string") {
    return "en";
  }

  return value.split("-")[0].toLowerCase();
};

const getDisplayNameForAstrology = (analysis: GenericObject): string => {
  return analysis?.full_name || "Astrology";
};

const getDisplayNameForSynastry = (analysis: GenericObject): string => {
  const p1 = analysis?.person1?.full_name || "P1";
  const p2 = analysis?.person2?.full_name || "P2";
  return `${p1}_${p2}`;
};

const validateManualPerson = (person: ManualPersonState, label: string): string => {
  if (!person.full_name.trim()) return `Completeaza numele pentru ${label}.`;
  if (!person.day || !person.month || !person.year) {
    return `Completeaza data nasterii pentru ${label}.`;
  }
  if (!person.selectedTime) return `Completeaza ora nasterii pentru ${label}.`;
  if (!person.place || !person.adress || !person.lat || !person.lon) {
    return `Selecteaza adresa din autocomplete pentru ${label}.`;
  }

  const day = Number(person.day);
  const month = Number(person.month);
  const year = Number(person.year);
  if (Number.isNaN(day) || day < 1 || day > 31) return `Zi invalida pentru ${label}.`;
  if (Number.isNaN(month) || month < 1 || month > 12) {
    return `Luna invalida pentru ${label}.`;
  }
  if (Number.isNaN(year) || year < 1900 || year > 2100) {
    return `An invalid pentru ${label}.`;
  }

  const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timePattern.test(person.selectedTime)) {
    return `Ora pentru ${label} trebuie sa fie in format HH:mm.`;
  }

  return "";
};

const SelectionTabs = ({
  items,
  selectedValue,
  onSelect,
}: {
  items: { id: string; label: string }[];
  selectedValue: string;
  onSelect: (id: string) => void;
}) => {
  return (
    <View style={styles.tabsWrap}>
      {items.map((item) => {
        const isSelected = selectedValue === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.tabItem, isSelected && styles.tabItemSelected]}
            onPress={() => onSelect(item.id)}
          >
            <Text style={[styles.tabText, isSelected && styles.tabTextSelected]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const SavedOptionsList = ({
  options,
  selectedId,
  onSelect,
}: {
  options: SavedOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) => {
  if (!options.length) {
    return (
      <View style={styles.emptyStateWrap}>
        <Text style={styles.emptyStateText}>
          Nu exista analize salvate pentru selectia curenta.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.optionsList}>
      {options.map((option) => {
        const isSelected = option.id === selectedId;
        return (
          <TouchableOpacity
            key={option.id}
            onPress={() => onSelect(option.id)}
            style={[styles.optionItem, isSelected && styles.optionItemSelected]}
          >
            <Text
              style={[
                styles.optionItemText,
                isSelected && styles.optionItemTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const LocationAutocompleteField = ({
  value,
  onTextChange,
  onLocationPick,
}: {
  value: string;
  onTextChange: (value: string) => void;
  onLocationPick: (location: {
    adress: string;
    place: string;
    lat: string;
    lon: string;
  }) => void;
}) => {
  const memoizedQuery = useMemo(() => GOOGLE_PLACES_QUERY, []);
  const memoizedPlacesStyles = useMemo(
    () => ({
      container: styles.googleContainer,
      textInputContainer: styles.googleInputContainer,
      listView: styles.googleListView,
      row: styles.googleRow,
      description: styles.googleDescription,
    }),
    []
  );
  const memoizedTextInputProps = useMemo(
    () => ({
      value,
      placeholderTextColor: "#B0AFA6",
      onChangeText: onTextChange,
      style: styles.locationInput,
    }),
    [onTextChange, value]
  );

  return (
    <View style={styles.locationContainer}>
      <GooglePlacesAutocomplete
        placeholder="Cauta adresa"
        minLength={2}
        fetchDetails
        debounce={700}
        query={memoizedQuery}
        textInputProps={memoizedTextInputProps}
        onPress={(data, details = null) => {
          const lat = details?.geometry?.location?.lat;
          const lon = details?.geometry?.location?.lng;
          const addressText = data?.description || "";
          onLocationPick({
            adress: addressText,
            place: addressText,
            lat: lat ? String(lat) : "",
            lon: lon ? String(lon) : "",
          });
        }}
        enablePoweredByContainer={false}
        styles={memoizedPlacesStyles}
      />
    </View>
  );
};

const ManualPersonForm = ({
  title,
  value,
  onChange,
}: {
  title: string;
  value: ManualPersonState;
  onChange: React.Dispatch<React.SetStateAction<ManualPersonState>>;
}) => {
  const setField = useCallback(
    (field: keyof ManualPersonState, fieldValue: string) => {
      onChange((prev) => ({
        ...prev,
        [field]: fieldValue,
      }));
    },
    [onChange]
  );

  const handleAddressTextChange = useCallback(
    (text: string) => {
      onChange((prev) => ({
        ...prev,
        adress: text,
        place: text,
      }));
    },
    [onChange]
  );

  const handleAddressPick = useCallback(
    (locationData: {
      adress: string;
      place: string;
      lat: string;
      lon: string;
    }) => {
      onChange((prev) => ({
        ...prev,
        adress: locationData.adress,
        place: locationData.place,
        lat: locationData.lat,
        lon: locationData.lon,
      }));
    },
    [onChange]
  );

  return (
    <View style={styles.formCard}>
      <Text style={styles.formCardTitle}>{title}</Text>
      <TextInput
        style={styles.input}
        value={value.full_name}
        onChangeText={(text) => setField("full_name", text)}
        placeholder="Nume complet"
        placeholderTextColor="#B0AFA6"
      />

      <View style={styles.rowInputs}>
        <TextInput
          style={[styles.input, styles.inputRow]}
          value={value.day}
          keyboardType="numeric"
          onChangeText={(text) => setField("day", text)}
          placeholder="Zi"
          placeholderTextColor="#B0AFA6"
        />
        <TextInput
          style={[styles.input, styles.inputRow]}
          value={value.month}
          keyboardType="numeric"
          onChangeText={(text) => setField("month", text)}
          placeholder="Luna"
          placeholderTextColor="#B0AFA6"
        />
        <TextInput
          style={[styles.input, styles.inputRow]}
          value={value.year}
          keyboardType="numeric"
          onChangeText={(text) => setField("year", text)}
          placeholder="An"
          placeholderTextColor="#B0AFA6"
        />
      </View>

      <TextInput
        style={styles.input}
        value={value.selectedTime}
        onChangeText={(text) => setField("selectedTime", text)}
        placeholder="Ora nasterii (HH:mm)"
        placeholderTextColor="#B0AFA6"
      />

      <SelectionTabs
        items={[
          { id: "male", label: "Male" },
          { id: "female", label: "Female" },
        ]}
        selectedValue={value.gender}
        onSelect={(gender) => setField("gender", gender)}
      />

      <LocationAutocompleteField
        value={value.adress}
        onTextChange={handleAddressTextChange}
        onLocationPick={handleAddressPick}
      />
    </View>
  );
};

const AdminPdfGeneratorScreen = () => {
  const navigation = useNavigation<any>();
  const { currentUser, userData } = useAuth();
  const { language } = useLanguage();

  const [dataSource, setDataSource] = useState<DataSource>("saved");
  const [analysisType, setAnalysisType] = useState<AnalysisType>("astrology");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [hasManualLanguageSelection, setHasManualLanguageSelection] =
    useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  const [astrologySavedOptions, setAstrologySavedOptions] = useState<SavedOption[]>(
    []
  );
  const [synastrySavedOptions, setSynastrySavedOptions] = useState<SavedOption[]>(
    []
  );
  const [selectedAstrologyId, setSelectedAstrologyId] = useState("");
  const [selectedSynastryId, setSelectedSynastryId] = useState("");

  const [manualAstrologyPerson, setManualAstrologyPerson] =
    useState<ManualPersonState>(initialPersonState());
  const [manualSynastryPerson1, setManualSynastryPerson1] =
    useState<ManualPersonState>(initialPersonState());
  const [manualSynastryPerson2, setManualSynastryPerson2] =
    useState<ManualPersonState>(initialPersonState());

  const accountEmail = useMemo(
    () => (currentUser?.email || userData?.email || "").trim(),
    [currentUser?.email, userData?.email]
  );

  const authEmail = useMemo(
    () => getAuthEmailForAdminCheck(currentUser?.email, userData?.email),
    [currentUser?.email, userData?.email]
  );
  const isAdmin = useMemo(() => isAdminEmail(authEmail), [authEmail]);

  const selectedAstrologyOption = useMemo(
    () =>
      astrologySavedOptions.find((option) => option.id === selectedAstrologyId) ||
      astrologySavedOptions[0] ||
      null,
    [astrologySavedOptions, selectedAstrologyId]
  );

  const selectedSynastryOption = useMemo(
    () =>
      synastrySavedOptions.find((option) => option.id === selectedSynastryId) ||
      synastrySavedOptions[0] ||
      null,
    [synastrySavedOptions, selectedSynastryId]
  );

  const refreshSavedData = async () => {
    setIsLoadingSaved(true);
    try {
      const savedData = await loadAdminSavedData();
      const fallbackEmail = accountEmail;

      const astrologyOptions = getAstrologySavedOptions(savedData, fallbackEmail);
      const synastryOptions = getSynastrySavedOptions(savedData, fallbackEmail);

      setAstrologySavedOptions(astrologyOptions as SavedOption[]);
      setSynastrySavedOptions(synastryOptions as SavedOption[]);
    } catch (error) {
      Alert.alert("Eroare", "Nu am putut incarca datele salvate.");
    } finally {
      setIsLoadingSaved(false);
    }
  };

  useEffect(() => {
    refreshSavedData();
  }, []);

  useEffect(() => {
    const defaultLanguage = normalizeLanguageCode(language);
    if (!hasManualLanguageSelection) {
      setSelectedLanguage(defaultLanguage || "en");
    }
  }, [language, hasManualLanguageSelection]);

  useEffect(() => {
    if (!selectedAstrologyId && astrologySavedOptions.length) {
      setSelectedAstrologyId(astrologySavedOptions[0].id);
    }
  }, [selectedAstrologyId, astrologySavedOptions]);

  useEffect(() => {
    if (!selectedSynastryId && synastrySavedOptions.length) {
      setSelectedSynastryId(synastrySavedOptions[0].id);
    }
  }, [selectedSynastryId, synastrySavedOptions]);

  useEffect(() => {
    if (!accountEmail) {
      return;
    }

    if (dataSource === "saved") {
      if (analysisType === "astrology" && selectedAstrologyOption) {
        setClientEmail(selectedAstrologyOption.emailPrefill || accountEmail);
        return;
      }

      if (analysisType === "synastry" && selectedSynastryOption) {
        setClientEmail(selectedSynastryOption.emailPrefill || accountEmail);
        return;
      }
    }

    if (!clientEmail) {
      setClientEmail(accountEmail);
    }
  }, [
    analysisType,
    dataSource,
    selectedAstrologyOption,
    selectedSynastryOption,
    accountEmail,
  ]);

  const handleGeneratePdf = async (mode: "email_and_local" | "local_only") => {
    if (!isAdmin) {
      Alert.alert("Acces blocat", "Acest ecran este disponibil doar pentru admin.");
      return;
    }

    if (mode === "email_and_local" && !clientEmail.trim()) {
      Alert.alert("Email lipsa", "Completeaza email-ul clientului.");
      return;
    }

    setIsWorking(true);
    try {
      const effectiveLanguage = normalizeLanguageCode(
        selectedLanguage || language || "en"
      );
      let preparedAnalysis: GenericObject | null = null;
      let html = "";
      let fullName = "";

      if (analysisType === "astrology") {
        if (dataSource === "saved") {
          if (!selectedAstrologyOption?.analysis) {
            throw new Error("Nu ai selectat o analiza astrology salvata.");
          }
          preparedAnalysis = selectedAstrologyOption.analysis;
        } else {
          const validationError = validateManualPerson(
            manualAstrologyPerson,
            "persoana"
          );
          if (validationError) {
            throw new Error(validationError);
          }
          preparedAnalysis = await buildManualAstrologyAnalysis(
            manualAstrologyPerson
          );
        }

        const translatedAnalysis = await translateAstrologyAnalysis(
          preparedAnalysis,
          effectiveLanguage
        );
        html = buildAstrologyPdfHtml(translatedAnalysis, effectiveLanguage);
        fullName = getDisplayNameForAstrology(translatedAnalysis);
      } else {
        if (dataSource === "saved") {
          if (!selectedSynastryOption?.analysis) {
            throw new Error("Nu ai selectat o analiza synastry salvata.");
          }
          preparedAnalysis = selectedSynastryOption.analysis;
        } else {
          const person1Error = validateManualPerson(
            manualSynastryPerson1,
            "persoana 1"
          );
          if (person1Error) {
            throw new Error(person1Error);
          }
          const person2Error = validateManualPerson(
            manualSynastryPerson2,
            "persoana 2"
          );
          if (person2Error) {
            throw new Error(person2Error);
          }
          preparedAnalysis = await buildManualSynastryAnalysis(
            manualSynastryPerson1,
            manualSynastryPerson2
          );
        }

        const translatedAnalysis = await translateSynastryAnalysis(
          preparedAnalysis,
          effectiveLanguage
        );
        html = buildSynastryPdfHtml(translatedAnalysis, effectiveLanguage);
        fullName = getDisplayNameForSynastry(translatedAnalysis);
      }

      let emailErrorMessage = "";

      if (mode === "email_and_local") {
        try {
          await sendPdfByEmail(clientEmail.trim(), html, fullName);
        } catch (error: any) {
          emailErrorMessage =
            error?.message ||
            "Nu s-a putut trimite email-ul. Se continua cu generarea locala.";
        }
      }

      await generateLocalPdfAndShare(
        html,
        `${analysisType}_${fullName}_${effectiveLanguage}`
      );

      if (mode === "email_and_local" && emailErrorMessage) {
        Alert.alert(
          "Email esuat",
          `${emailErrorMessage}\nPDF-ul a fost generat local.`
        );
      } else if (mode === "email_and_local") {
        Alert.alert("Succes", "PDF-ul a fost trimis pe email si generat local.");
      } else {
        Alert.alert("Succes", "PDF-ul a fost generat local.");
      }
    } catch (error: any) {
      Alert.alert("Eroare", error?.message || "Nu am putut genera PDF-ul.");
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#000000", "#434343"]} style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardWrap}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 70 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Admin PDF Generator</Text>
              <Text style={styles.subtitle}>
                Generare PDF Astrology/Synastry cu date saved sau manual.
              </Text>
            </View>

            {!isAdmin ? (
              <View style={styles.blockedCard}>
                <Text style={styles.blockedText}>
                  Acest ecran este ascuns si disponibil doar pentru conturile admin.
                </Text>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.secondaryButtonText}>Inapoi</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Data Source</Text>
                  <SelectionTabs
                    items={[
                      { id: "saved", label: "Saved" },
                      { id: "manual", label: "Manual" },
                    ]}
                    selectedValue={dataSource}
                    onSelect={(value) => setDataSource(value as DataSource)}
                  />
                </View>

                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Analysis Type</Text>
                  <SelectionTabs
                    items={[
                      { id: "astrology", label: "Astrology" },
                      { id: "synastry", label: "Synastry" },
                    ]}
                    selectedValue={analysisType}
                    onSelect={(value) => setAnalysisType(value as AnalysisType)}
                  />
                </View>

                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Language</Text>
                  <View style={styles.languageWrap}>
                    {languages.map((lang: any) => {
                      const langCode = normalizeLanguageCode(lang.code);
                      const selected = selectedLanguage === langCode;
                      return (
                        <TouchableOpacity
                          key={langCode}
                          style={[
                            styles.languageChip,
                            selected && styles.languageChipSelected,
                          ]}
                          onPress={() => {
                            setSelectedLanguage(langCode);
                            setHasManualLanguageSelection(true);
                          }}
                        >
                          <Text
                            style={[
                              styles.languageChipText,
                              selected && styles.languageChipTextSelected,
                            ]}
                          >
                            {lang.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <Text style={styles.selectedLanguageText}>
                    Limba PDF selectata: {selectedLanguage.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Email client</Text>
                  <TextInput
                    style={styles.input}
                    value={clientEmail}
                    placeholder="client@email.com"
                    placeholderTextColor="#B0AFA6"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={setClientEmail}
                  />
                </View>

                {dataSource === "saved" ? (
                  <View style={styles.sectionCard}>
                    <View style={styles.savedHeaderRow}>
                      <Text style={styles.sectionTitle}>Saved Analyses</Text>
                      <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={refreshSavedData}
                      >
                        <Text style={styles.refreshButtonText}>Refresh</Text>
                      </TouchableOpacity>
                    </View>

                    {isLoadingSaved ? (
                      <ActivityIndicator color="#FFD700" />
                    ) : analysisType === "astrology" ? (
                      <SavedOptionsList
                        options={astrologySavedOptions}
                        selectedId={selectedAstrologyId}
                        onSelect={(id) => {
                          setSelectedAstrologyId(id);
                          const selected = astrologySavedOptions.find(
                            (opt) => opt.id === id
                          );
                          if (selected?.emailPrefill) {
                            setClientEmail(selected.emailPrefill);
                          }
                        }}
                      />
                    ) : (
                      <SavedOptionsList
                        options={synastrySavedOptions}
                        selectedId={selectedSynastryId}
                        onSelect={(id) => {
                          setSelectedSynastryId(id);
                          const selected = synastrySavedOptions.find(
                            (opt) => opt.id === id
                          );
                          if (selected?.emailPrefill) {
                            setClientEmail(selected.emailPrefill);
                          }
                        }}
                      />
                    )}
                  </View>
                ) : analysisType === "astrology" ? (
                  <ManualPersonForm
                    title="Astrology Manual"
                    value={manualAstrologyPerson}
                    onChange={setManualAstrologyPerson}
                  />
                ) : (
                  <>
                    <ManualPersonForm
                      title="Synastry - Persoana 1"
                      value={manualSynastryPerson1}
                      onChange={setManualSynastryPerson1}
                    />
                    <ManualPersonForm
                      title="Synastry - Persoana 2"
                      value={manualSynastryPerson2}
                      onChange={setManualSynastryPerson2}
                    />
                  </>
                )}

                <View style={styles.actionWrap}>
                  <TouchableOpacity
                    style={[styles.primaryButton, isWorking && styles.disabledButton]}
                    disabled={isWorking}
                    onPress={() => handleGeneratePdf("email_and_local")}
                  >
                    {isWorking ? (
                      <ActivityIndicator color="#1A1A1A" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Trimite email + local</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.secondaryButton, isWorking && styles.disabledButton]}
                    disabled={isWorking}
                    onPress={() => handleGeneratePdf("local_only")}
                  >
                    <Text style={styles.secondaryButtonText}>Doar local</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
  },
  keyboardWrap: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    color: "#FFD700",
    fontFamily: "LoraBold",
    fontSize: 24,
  },
  subtitle: {
    marginTop: 4,
    color: "#FFFFFF",
    fontFamily: "Lora",
    fontSize: 14,
  },
  sectionCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.25)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#FFD700",
    fontFamily: "LoraBold",
    fontSize: 15,
    marginBottom: 10,
  },
  tabsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  tabItemSelected: {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
  },
  tabText: {
    color: "#FFFFFF",
    fontFamily: "Lora",
    fontSize: 13,
  },
  tabTextSelected: {
    color: "#1A1A1A",
    fontFamily: "LoraBold",
  },
  languageWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  languageChip: {
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  languageChipSelected: {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
  },
  languageChipText: {
    color: "#FFFFFF",
    fontFamily: "Lora",
    fontSize: 12,
  },
  languageChipTextSelected: {
    color: "#1A1A1A",
    fontFamily: "LoraBold",
  },
  selectedLanguageText: {
    marginTop: 10,
    color: "#FFFFFF",
    fontFamily: "Lora",
    fontSize: 12,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#FFD700",
    backgroundColor: "#FFFFFF",
    color: "#1A1A1A",
    paddingHorizontal: 12,
    fontFamily: "Lora",
    fontSize: 15,
  },
  savedHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  refreshButton: {
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  refreshButtonText: {
    color: "#FFD700",
    fontFamily: "LoraBold",
    fontSize: 12,
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  optionItemSelected: {
    borderColor: "#FFD700",
    backgroundColor: "rgba(255,215,0,0.14)",
  },
  optionItemText: {
    color: "#FFFFFF",
    fontFamily: "Lora",
    fontSize: 14,
  },
  optionItemTextSelected: {
    color: "#FFD700",
    fontFamily: "LoraBold",
  },
  emptyStateWrap: {
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
    borderRadius: 12,
    padding: 12,
  },
  emptyStateText: {
    color: "#FFFFFF",
    fontFamily: "Lora",
    fontSize: 14,
  },
  formCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.25)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  formCardTitle: {
    color: "#FFD700",
    fontFamily: "LoraBold",
    fontSize: 16,
    marginBottom: 10,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 8,
  },
  inputRow: {
    flex: 1,
  },
  locationContainer: {
    zIndex: 1000,
    marginTop: 10,
  },
  googleContainer: {
    flex: 0,
  },
  googleInputContainer: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },
  locationInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#FFD700",
    backgroundColor: "#FFFFFF",
    color: "#1A1A1A",
    paddingHorizontal: 12,
    fontFamily: "Lora",
    fontSize: 15,
  },
  googleListView: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 6,
    zIndex: 1001,
  },
  googleRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  googleDescription: {
    color: "#1A1A1A",
    fontFamily: "Lora",
    fontSize: 14,
  },
  actionWrap: {
    marginTop: 10,
    gap: 10,
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: "#FFD700",
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#1A1A1A",
    fontFamily: "LoraBold",
    fontSize: 16,
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFD700",
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#FFD700",
    fontFamily: "LoraBold",
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.6,
  },
  blockedCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.25)",
    padding: 14,
  },
  blockedText: {
    color: "#FFFFFF",
    fontFamily: "Lora",
    fontSize: 14,
    marginBottom: 10,
  },
});

export default AdminPdfGeneratorScreen;
