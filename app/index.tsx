import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function Index() {
  const [medicine, setMedicine] = useState("");
  const [medicines, setMedicines] = useState<{ name: string; time: Date }[]>([]);
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Ask notification permission once
  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  // Add medicine + schedule daily notification
  const addMedicine = async () => {
    if (medicine.trim() === "") return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "💊 Medicine Reminder",
        body: `Time to take ${medicine}`,
      },
      trigger: {
        hour: time.getHours(),
        minute: time.getMinutes(),
        repeats: true,
      },
    });

    setMedicines([...medicines, { name: medicine, time }]);
    setMedicine("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💊 Medicare Assistant</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter medicine name"
        placeholderTextColor="#9ca3af"
        value={medicine}
        onChangeText={setMedicine}
      />

      <TouchableOpacity style={styles.button} onPress={() => setShowPicker(true)}>
        <Text style={styles.buttonText}>
          ⏰ Pick Time ({time.toLocaleTimeString()})
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={(event, selectedTime) => {
            setShowPicker(false);
            if (selectedTime) setTime(selectedTime);
          }}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={addMedicine}>
        <Text style={styles.buttonText}>➕ Add Medicine</Text>
      </TouchableOpacity>

      <FlatList
        data={medicines}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.medicineItem}>
            <Text style={styles.medicineText}>
              💊 {item.name} — ⏰ {item.time.toLocaleTimeString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#38bdf8",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#1e293b",
    color: "white",
    fontSize: 18,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#38bdf8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: "#020617",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  medicineItem: {
    backgroundColor: "#1e293b",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  medicineText: {
    color: "white",
    fontSize: 18,
  },
});
