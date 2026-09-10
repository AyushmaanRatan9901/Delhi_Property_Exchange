import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BankDetails } from "../../constants/fieldAgentData";

interface BankDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  bankDetails: BankDetails;
  onSave: (details: Partial<BankDetails>) => void;
}

export const BankDetailsModal: React.FC<BankDetailsModalProps> = ({
  visible,
  onClose,
  bankDetails,
  onSave,
}) => {
  const [upiId, setUpiId] = useState(bankDetails.upiId);
  const [accountHolder, setAccountHolder] = useState(bankDetails.accountHolder);
  const [bankName, setBankName] = useState(bankDetails.bankName);
  const [accountNumber, setAccountNumber] = useState(bankDetails.accountNumber);
  const [ifsc, setIfsc] = useState(bankDetails.ifsc);

  const handleSave = () => {
    if (!upiId.trim()) {
      Alert.alert("Error", "Please enter a valid UPI ID for commission payouts.");
      return;
    }
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    onSave({
      upiId: upiId.trim(),
      accountHolder: accountHolder.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      ifsc: ifsc.trim().toUpperCase(),
    });
    Alert.alert("Success", "Payout Bank & UPI details saved successfully!");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="card" size={20} color="#0D9488" />
              <Text style={styles.title}>Payout Bank & UPI Details</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Primary UPI ID (Instant Payouts) *</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={upiId}
              onChangeText={setUpiId}
              placeholder="e.g. yourname@okaxis"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Account Holder Name</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={accountHolder}
              onChangeText={setAccountHolder}
              placeholder="Full name as in bank"
            />
          </View>

          <Text style={styles.label}>Bank Name</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={bankName}
              onChangeText={setBankName}
              placeholder="e.g. HDFC Bank"
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={{ flex: 1.4 }}>
              <Text style={styles.label}>Account Number</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  placeholder="Account Number"
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>IFSC Code</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  value={ifsc}
                  onChangeText={setIfsc}
                  placeholder="IFSC"
                  autoCapitalize="characters"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.88} onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save Payout Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 16.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  closeBtn: {
    padding: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    marginTop: 10,
    marginBottom: 4,
  },
  inputBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    justifyContent: "center",
  },
  input: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  rowInputs: {
    flexDirection: "row",
    gap: 10,
  },
  saveBtn: {
    backgroundColor: "#0D9488",
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
