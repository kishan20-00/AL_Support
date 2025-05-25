import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, ScrollView, Alert, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Text } from 'react-native-paper';
import axios from 'axios';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc, collection, serverTimestamp, updateDoc, arrayUnion, query, where, getDocs } from 'firebase/firestore';

const PredictionScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    'Mental Status': '',
    'Attendance Rate': '',
    'Study Hours per Week': '',
    'Previous Mathematics  average': '',
    'Previous Physics average': '',
    'Previous Chemistry average': '',
    failures: '',
    famrel: '',
    freetime: '',
    goout: '',
    absences: ''
  });

  const [backgroundData, setBackgroundData] = useState({
    Gender: '',
    'Extracurricular Activities': '',
    'Family Support': '',
    guardian: '',
    schoolsup: '',
    paidClass: '',
    'Parent Education': '',
    Dalc: '',
    Walc: ''
  });

  const [userEmail, setUserEmail] = useState(null);

  // Mapping for correct variable names
  const fieldMapping = {
    'gender': 'Gender',
    'hobbies': 'Extracurricular Activities',
    'family': 'Family Support',
    'parentedu': 'Parent Education',
    'dalc': 'Dalc',
    'walc': 'Walc'
  };

  useEffect(() => {
    // Get logged-in user email
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
      fetchBackgroundData(user.email); // Fetch background data after email is set
      fetchStressLevelData(user.email); // Fetch stress level data after email is set
    } else {
      Alert.alert('Error', 'User not logged in. Please sign in.');
    }
  }, []);

  const fetchBackgroundData = async (email) => {
    try {
      const userEmailLowerCase = email.toLowerCase();
      const backgroundDocRef = doc(db, 'background', userEmailLowerCase);
      const docSnap = await getDoc(backgroundDocRef);

      if (docSnap.exists()) {
        setBackgroundData(docSnap.data());
      } else {
        Alert.alert('Error', 'No background data found for this user.');
      }
    } catch (error) {
      console.error('Error fetching background data:', error);
      Alert.alert('Error', 'An error occurred while fetching background data.');
    }
  };

  const fetchStressLevelData = async (email) => {
    try {
      const stressLevelQuery = query(collection(db, 'stresslevel'), where('email', '==', email));
      const querySnapshot = await getDocs(stressLevelQuery);

      if (!querySnapshot.empty) {
        // Assuming there's only one document per user in the stresslevel collection
        const stressLevelDoc = querySnapshot.docs[0].data();
        const predictedClass = stressLevelDoc.predictedClass;

        // Set the predictedClass to the 'Mental Status' field in formData
        setFormData((prevData) => ({
          ...prevData,
          'Mental Status': predictedClass,
        }));
      } else {
        Alert.alert('Info', 'No stress level data found for this user.');
      }
    } catch (error) {
      console.error('Error fetching stress level data:', error);
      Alert.alert('Error', 'An error occurred while fetching stress level data.');
    }
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const labelMapping = {
    'Mental Status': 'Mental Well-being',
    'Attendance Rate': 'Class Attendance (%)',
    'Study Hours per Week': 'Weekly Study Hours',
    'Previous Mathematics  average': 'Math Average Score',
    'Previous Physics average': 'Physics Average Score',
    'Previous Chemistry average': 'Chemistry Average Score',
    'failures': 'The number of times failing subject(0-3)',
    'famrel': 'Family Relationship Quality (0.56 - 7.5)',
    'freetime': 'Free Time after School (0-7)',
    'goout': 'Socializing Frequency (0-7)',
    'absences': 'Total Absences (0-25)',
  };

  const handleSubmit = async () => {
    if (!userEmail) {
      Alert.alert('Error', 'User email not found. Please log in.');
      return;
    }

    try {
      // Combine Firestore background data and user input form data
      const combinedData = {
        ...backgroundData,
        ...formData,
        email: userEmail, // Add email to the data
      };

      // Map the fields to match the API's expected format
      const formattedData = Object.keys(combinedData).reduce((acc, key) => {
        const formattedKey = fieldMapping[key] || key; // Map field names, or use the key as it is
        acc[formattedKey] = combinedData[key];
        return acc;
      }, {});

      // Call the Flask API to get the predicted study plan
      const response = await axios.post('http://192.168.1.100:5002/predict', formattedData);
      const predictedStudyPlan = response.data['Predicted Study Plan'];

      Alert.alert('Prediction Result', `Predicted Study Plan: ${predictedStudyPlan}`);

      // Reference to the Firestore document for study plans
      const userDocRef = doc(collection(db, 'study_plans'), userEmail);

      // Check if the user already has a study plan
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        // Update existing study plan
        await setDoc(userDocRef, { study_plan: predictedStudyPlan, timestamp: serverTimestamp() }, { merge: true });
      } else {
        // Create a new study plan entry
        await setDoc(userDocRef, { study_plan: predictedStudyPlan });
        Alert.alert('Success', 'Study Plan saved successfully.');
      }

      // Save performance data to the 'Performance' collection
      const performanceDocRef = doc(collection(db, 'Performance'), userEmail);

      // Prepare the historical data object (excluding 'Mental Status')
      const historicalData = {
        timestamp: new Date().toISOString(), // Use JavaScript's Date object instead of serverTimestamp()
        ...Object.keys(formData).reduce((acc, key) => {
          if (key !== 'Mental Status') {
            acc[key] = formData[key];
          }
          return acc;
        }, {})
      };

      // Check if the document exists
      const performanceDocSnap = await getDoc(performanceDocRef);

      if (performanceDocSnap.exists()) {
        // Update existing document with new historical data
        await updateDoc(performanceDocRef, {
          historicalData: arrayUnion(historicalData)
        });
      } else {
        // Create a new document with historical data as an array
        await setDoc(performanceDocRef, {
          historicalData: [historicalData]
        });
      }

      Alert.alert('Success', 'Performance data saved successfully.');

      navigation.replace('Drawer');

    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Error', error.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text variant="headlineLarge" style={styles.title}>Academic Performance</Text>

          {/* Render form inputs for numeric data */}
          {Object.keys(formData).map((key) => (
            <View key={key} style={styles.inputContainer}>
              <Text style={styles.label}>{labelMapping[key] || key}</Text>
              <TextInput
                style={styles.input}
                placeholder={`Enter ${labelMapping[key] || key}`}  // Use the mapped label or fallback to key
                value={formData[key]}
                onChangeText={(value) => handleChange(key, value)}
              />
            </View>
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
  inputContainer: {
    width: '100%',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default PredictionScreen;