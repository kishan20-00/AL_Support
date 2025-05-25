import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const NotificationScreen = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestDoctor = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // Step 1: Fetch the latest doctorId from stresslevel/{email}
          const stressDocRef = doc(db, 'stresslevel', user.email);
          const stressDoc = await getDoc(stressDocRef);

          if (stressDoc.exists()) {
            const predictions = stressDoc.data().predictions || [];
            if (predictions.length > 0) {
              // Get the latest prediction
              const latestPrediction = predictions[predictions.length - 1];
              const doctorId = latestPrediction.predictedDoctor; // Ensure this matches your field name

              // Step 2: Fetch doctor details from doctor_details collection
              if (doctorId) {
                const doctorDocRef = doc(db, 'doctor_details', doctorId.toString()); // Ensure ID is string
                const doctorDoc = await getDoc(doctorDocRef);

                if (doctorDoc.exists()) {
                  setDoctor(doctorDoc.data());
                }
              }
            }
          }
        } catch (error) {
          console.error("Error fetching doctor details:", error);
        }
      }
      setLoading(false);
    };

    fetchLatestDoctor();
  }, []);

  const handleCall = () => {
    if (doctor?.number) { // Changed from 'contact' to 'number' to match your sample
      Linking.openURL(`tel:${doctor.number}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ea" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Updated Title */}
      <Text variant="headlineMedium" style={styles.title}>
        Recommended Doctor
      </Text>

      {/* Doctor Details Card */}
      <Card style={styles.notificationCard}>
        <Card.Content>
          {doctor ? (
            <>
              <Text variant="titleLarge" style={styles.notificationTitle}>
                👨‍⚕️ Doctor Details 👩‍⚕️
              </Text>
              <View style={styles.doctorDetails}>
                <Text variant="bodyMedium" style={styles.doctorName}>
                  Name: {doctor.name}
                </Text>
                <Text variant="bodyMedium" style={styles.specialization}>
                  Specialization: {doctor.speciality} {/* Note: 'speciality' matches your sample */}
                </Text>
                <Text variant="bodyMedium" style={styles.contact}>
                  Contact: {doctor.number} {/* Changed from 'contact' to 'number' */}
                </Text>
              </View>
              <Button 
                mode="contained" 
                onPress={handleCall} 
                style={styles.callButton}
                disabled={!doctor.number} // Disable if no number exists
              >
                Call Doctor
              </Button>
            </>
          ) : (
            <Text variant="bodyMedium" style={styles.notificationText}>
              No doctor recommendations found.
            </Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

// Styles remain the same as your original
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  notificationCard: {
    marginBottom: 20,
    backgroundColor: '#fff',
    elevation: 3,
    borderRadius: 10,
    padding: 15,
  },
  notificationTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 20,
  },
  notificationText: {
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 16,
    color: '#666',
  },
  doctorDetails: {
    marginBottom: 15,
  },
  doctorName: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  specialization: {
    color: '#666',
    marginBottom: 5,
  },
  contact: {
    color: '#666',
    marginBottom: 10,
  },
  callButton: {
    backgroundColor: '#6200ea',
    marginTop: 10,
  },
});

export default NotificationScreen;