import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, ScrollView, Alert, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Text } from 'react-native-paper';
import axios from 'axios';
import { auth, db } from '../firebaseConfig'; // Firebase config
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';

const StressScreen = () => {
  const [features, setFeatures] = useState(Array(21).fill(''));
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    // Fetch logged-in user's email
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (index, value) => {
    if (/^[0-3]?$/.test(value)) { // Only allow numbers 0-3
      const updatedFeatures = [...features];
      updatedFeatures[index] = value;
      setFeatures(updatedFeatures);
    }
  };

  const handleSubmit = async () => {
    if (!userEmail) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    try {
      const response = await axios.post('http://192.168.1.100:5004/predict', { features: features.map(Number) });
      const predictedClass = response.data.predicted_class;

      Alert.alert('Prediction Result', `Predicted Class: ${predictedClass}`);

      // Check if the user's record exists in Firestore
      const stressRef = collection(db, 'stresslevel');
      const q = query(stressRef, where('email', '==', userEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Update existing record
        const docRef = querySnapshot.docs[0].ref;
        await setDoc(docRef, { email: userEmail, predictedClass }, { merge: true });
      } else {
        // Create a new record
        const newDocRef = doc(stressRef);
        await setDoc(newDocRef, { email: userEmail, predictedClass });
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text variant="headlineLarge" style={styles.title}>Class Prediction</Text>

          {features.map((value, index) => (
            <TextInput
              key={index}
              style={styles.input}
              placeholder={`Feature ${index + 1}`}
              keyboardType="numeric"
              value={value}
              onChangeText={(text) => handleChange(index, text)}
              maxLength={1} // Restrict to single digit (0-3)
            />
          ))}

          <View style={styles.buttonContainer}>
            <Button title="Predict" onPress={handleSubmit} color="#6200ea" />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 10,
    width: '100%',
  },
});

export default StressScreen;
