import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, ScrollView, Alert, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Text } from 'react-native-paper';
import axios from 'axios';
import { auth, db } from '../firebaseConfig';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

const PredictionScreen = () => {
  const [formData, setFormData] = useState({
    'Mental Status': '',
    Gender: '',
    'Extracurricular Activities': '',
    'Family Support': '',
    guardian: '',
    schoolsup: '',
    paidClass: '',
    'Parent Education': '',
    'Attendance Rate': '',
    'Study Hours per Week': '',
    'Previous Mathematics  average': '',
    'Previous Physics average': '',
    'Previous Chemistry average': '',
    failures: '',
    famrel: '',
    freetime: '',
    goout: '',
    Dalc: '',
    Walc: '',
    absences: ''
  });

  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    // Get logged-in user email
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
    } else {
      Alert.alert('Error', 'User not logged in. Please sign in.');
    }
  }, []);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!userEmail) {
      Alert.alert('Error', 'User email not found. Please log in.');
      return;
    }

    try {
      // Call API to get predicted study plan
      const response = await axios.post('http://192.168.1.100:5001/predict', formData);
      const predictedStudyPlan = response.data['Predicted Study Plan'];

      Alert.alert('Prediction Result', `Predicted Study Plan: ${predictedStudyPlan}`);

      // Reference to the Firestore document
      const userDocRef = doc(collection(db, 'study_plans'), userEmail);

      // Check if the user already has a study plan
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        // Update existing study plan
        await setDoc(userDocRef, { study_plan: predictedStudyPlan }, { merge: true });
        Alert.alert('Success', 'Study Plan updated successfully.');
      } else {
        // Create a new study plan entry
        await setDoc(userDocRef, { study_plan: predictedStudyPlan });
        Alert.alert('Success', 'Study Plan saved successfully.');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text variant="headlineLarge" style={styles.title}>Study Plan Prediction</Text>
          {Object.keys(formData).map((key) => (
            <TextInput
              key={key}
              style={styles.input}
              placeholder={key}
              value={formData[key]}
              onChangeText={(value) => handleChange(key, value)}
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
  flex: {
    flex: 1,
  },
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
  },
  buttonContainer: {
    marginTop: 10,
    width: '100%',
  },
});

export default PredictionScreen;
