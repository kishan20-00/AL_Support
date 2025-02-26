import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Text } from 'react-native-paper';
import axios from 'axios';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';

const PlaylistPredictionScreen = () => {
  const [formData, setFormData] = useState({
    Emotion: '',
    Climate: '',
    Time: ''
  });
  const [prediction, setPrediction] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Fetch logged-in user's email
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
    }
  }, []);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!userEmail) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    try {
      const response = await axios.get('http://192.168.1.100:5003/predict', {
        params: formData
      });
      const predictedPlaylist = response.data["Predicted Playlist"];
      setPrediction(predictedPlaylist);
      Alert.alert('Prediction Result', `Predicted Playlist: ${predictedPlaylist}`);

      // Check if user already has a record in 'musicpredict'
      const musicPredictRef = collection(db, 'musicpredict');
      const q = query(musicPredictRef, where('email', '==', userEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // If record exists, update it
        const docRef = querySnapshot.docs[0].ref;
        await setDoc(docRef, {
          email: userEmail,
          emotion: formData.Emotion,
          climate: formData.Climate,
          time: formData.Time,
          predictedPlaylist
        }, { merge: true });
      } else {
        // If no record exists, create a new one
        const newDocRef = doc(musicPredictRef, userEmail);
        await setDoc(newDocRef, {
          email: userEmail,
          emotion: formData.Emotion,
          climate: formData.Climate,
          time: formData.Time,
          predictedPlaylist
        });
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text variant="headlineLarge" style={styles.title}>Playlist Prediction</Text>
          <TextInput
            style={styles.input}
            placeholder="Emotion"
            value={formData.Emotion}
            onChangeText={(value) => handleChange('Emotion', value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Climate"
            value={formData.Climate}
            onChangeText={(value) => handleChange('Climate', value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Time"
            value={formData.Time}
            onChangeText={(value) => handleChange('Time', value)}
          />
          <View style={styles.buttonContainer}>
            <Button title="Predict" onPress={handleSubmit} color="#6200ea" />
          </View>
          {prediction !== '' && <Text style={styles.result}>Predicted Playlist: {prediction}</Text>}
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
  result: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
  }
});

export default PlaylistPredictionScreen;
