import React, { useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../../context/AuthContext";
import {
  getAuthEmailForAdminCheck,
  isAdminEmail,
} from "../../features/adminPdf/adminAccess";
import { screenName } from "../../utils/screenName";

const ADMIN_GATE_PASSWORD = "1234567890";

const AdminPdfGateScreen = () => {
  const navigation = useNavigation<any>();
  const { currentUser, userData } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const authEmail = useMemo(
    () => getAuthEmailForAdminCheck(currentUser?.email, userData?.email),
    [currentUser?.email, userData?.email]
  );
  const isAdmin = useMemo(() => isAdminEmail(authEmail), [authEmail]);

  const handleValidatePassword = () => {
    if (!isAdmin) {
      Alert.alert("Acces blocat", "Acest ecran este disponibil doar pentru admin.");
      return;
    }

    if (password === ADMIN_GATE_PASSWORD) {
      setError("");
      setPassword("");
      navigation.navigate(screenName.AdminPdfGenerator);
      return;
    }

    setError("Parola este gresita.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#000000", "#434343"]} style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Admin PDF Access</Text>
          {!isAdmin ? (
            <>
              <Text style={styles.blockedText}>
                Contul curent nu are acces la generatorul admin.
              </Text>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.secondaryButtonText}>Inapoi</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.description}>
                Introdu parola pentru a deschide generatorul PDF admin.
              </Text>
              <TextInput
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  if (error) {
                    setError("");
                  }
                }}
                secureTextEntry
                placeholder="Parola"
                placeholderTextColor="#B0AFA6"
                style={styles.input}
              />
              {!!error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleValidatePassword}
              >
                <Text style={styles.primaryButtonText}>Acceseaza</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
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
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.25)",
    padding: 20,
  },
  title: {
    color: "#FFD700",
    fontFamily: "LoraBold",
    fontSize: 22,
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    color: "#FFFFFF",
    fontFamily: "Lora",
    fontSize: 14,
    marginBottom: 14,
    textAlign: "center",
  },
  blockedText: {
    color: "#FFFFFF",
    fontFamily: "Lora",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#FFD700",
    color: "#000000",
    fontSize: 16,
    fontFamily: "Lora",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: {
    color: "#FF6B6B",
    marginTop: 8,
    fontFamily: "Lora",
    fontSize: 13,
  },
  primaryButton: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#FFD700",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#1A1A1A",
    fontSize: 16,
    fontFamily: "LoraBold",
  },
  secondaryButton: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFD700",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#FFD700",
    fontSize: 15,
    fontFamily: "LoraBold",
  },
});

export default AdminPdfGateScreen;
