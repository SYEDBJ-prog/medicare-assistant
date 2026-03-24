import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ImageBackground, ScrollView, Switch, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, FlatList 
} from 'react-native';
import { GlobalMedicines } from './medicines';

export default function App() {
  const [isUrdu, setIsUrdu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedFormula, setSelectedFormula] = useState('');
  const [time, setTime] = useState('');

  const API_URL = "http://192.168.100.7:5000"; 

  const t = {
    en: { title: "Medicare Global", sub: "Worldwide Database", name: "Patient Name", med: "Search Medicine...", btn: "Sync to Cloud 🌍", histBtn: "View History 📜", back: "⬅️ Back to Add" },
    ur: { title: "میڈیکیئر گلوبل", sub: "عالمی ڈیٹا بیس", name: "مریض کا نام", med: "دوا تلاش کریں...", btn: "کلاؤڈ پر محفوظ کریں 🌍", histBtn: "ہسٹری دیکھیں 📜", back: "⬅️ واپس جائیں" }
  }[isUrdu ? 'ur' : 'en'];

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/get-all`);
      const data = await response.json();
      setHistory(data);
      setShowHistory(true);
    } catch (e) {
      Alert.alert("Error", "Could not fetch history. Check Server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.length > 2) {
      try {
        const response = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:${text}*&limit=5`);
        const data = await response.json();
        let apiResults = data.results ? data.results.map(item => ({
          name: item.openfda.brand_name[0],
          formula: item.openfda.generic_name ? item.openfda.generic_name[0] : "N/A"
        })) : [];
        const localResults = GlobalMedicines.filter(m => m.name.toLowerCase().includes(text.toLowerCase()));
        setSuggestions([...localResults, ...apiResults]);
      } catch (e) { setSuggestions(GlobalMedicines.filter(m => m.name.toLowerCase().includes(text.toLowerCase()))); }
    } else { setSuggestions([]); }
  };

  const handleSave = async () => {
    if (!patientName || !searchQuery) return Alert.alert("Required", "Name & Medicine are must!");
    try {
      await fetch(`${API_URL}/add-patient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: patientName, medicine: searchQuery, formula: selectedFormula, time: time }),
      });
      Alert.alert("Success!", t.title + " Updated");
      setPatientName(''); setSearchQuery(''); setSelectedFormula(''); setTime('');
    } catch (e) { Alert.alert("Error", "Server Connection Failed"); }
  };

  return (
    <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1532187875605-2fe3593b18be' }} style={styles.bg}>
      <View style={styles.container}>
        <View style={styles.glassCard}>
          <View style={styles.langRow}>
            <Text style={styles.langText}>EN</Text>
            <Switch value={isUrdu} onValueChange={setIsUrdu} />
            <Text style={styles.langText}>اردو</Text>
          </View>

          {!showHistory ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>{t.title}</Text>
              <Text style={styles.subtitle}>{t.sub}</Text>

              <TextInput style={styles.input} placeholder={t.name} placeholderTextColor="#ccc" value={patientName} onChangeText={setPatientName} />
              <TextInput style={[styles.input, {marginTop:15}]} placeholder={t.med} placeholderTextColor="#ccc" value={searchQuery} onChangeText={handleSearch} />
              
              {suggestions.length > 0 && (
                <View style={styles.suggestionBox}>
                  {suggestions.slice(0, 4).map((item, index) => (
                    <TouchableOpacity key={index} style={styles.suggestItem} onPress={() => { setSearchQuery(item.name); setSelectedFormula(item.formula); setSuggestions([]); }}>
                      <Text style={styles.suggestText}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TextInput style={[styles.input, {marginTop:15}]} placeholder="Time" placeholderTextColor="#ccc" value={time} onChangeText={setTime} />
              
              <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>{t.btn}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, {backgroundColor:'rgba(255,255,255,0.1)', marginTop:10}]} onPress={fetchHistory}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t.histBtn}</Text>}
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={{flex:1}}>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <Text style={{color:'#00f2fe', fontWeight:'bold', marginBottom:15}}>{t.back}</Text>
              </TouchableOpacity>
              <Text style={styles.title}>{isUrdu ? "تاریخچہ" : "Medical History"}</Text>
              <FlatList 
                data={history}
                keyExtractor={(item) => item._id}
                renderItem={({item}) => (
                  <View style={styles.historyItem}>
                    <Text style={{color:'#fff', fontWeight:'bold'}}>{item.name}</Text>
                    <Text style={{color:'#ccc', fontSize:12}}>{item.medicine} - {item.time}</Text>
                    <Text style={{color:'#4fd1c5', fontSize:10}}>{item.formula}</Text>
                  </View>
                )}
              />
            </View>
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, resizeMode: 'cover' },
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  glassCard: { flex: 0.8, backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: 30, padding: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  langRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 10 },
  langText: { color: '#fff', fontSize: 12 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  subtitle: { fontSize: 12, color: '#00f2fe', textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 15, color: '#fff' },
  suggestionBox: { backgroundColor: '#222', borderRadius: 10, marginTop: 5 },
  suggestItem: { padding: 12, borderBottomWidth: 0.5, borderBottomColor: '#444' },
  suggestText: { color: '#fff' },
  button: { backgroundColor: '#007AFF', borderRadius: 15, padding: 15, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  historyItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' }
});