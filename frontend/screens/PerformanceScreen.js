import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';

const PerformanceDisplay = () => {
  const [performances, setPerformances] = useState({
    math: [],
    physics: [],
    chemistry: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformances = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.error('User not logged in');
          return;
        }

        const userEmail = user.email.toLowerCase();
        const performanceDocRef = doc(db, 'Performance', userEmail);
        const docSnap = await getDoc(performanceDocRef);

        if (docSnap.exists()) {
          const historicalData = docSnap.data().historicalData;

          // Extract the last 3 performances for each subject
          const lastThreeMath = historicalData
            .slice(-3)
            .map((entry) => ({
              score: parseFloat(entry['Previous Mathematics  average'] || 0),
              timestamp: entry.timestamp || 'No date',
            }));

          const lastThreePhysics = historicalData
            .slice(-3)
            .map((entry) => ({
              score: parseFloat(entry['Previous Physics average'] || 0),
              timestamp: entry.timestamp || 'No date',
            }));

          const lastThreeChemistry = historicalData
            .slice(-3)
            .map((entry) => ({
              score: parseFloat(entry['Previous Chemistry average'] || 0),
              timestamp: entry.timestamp || 'No date',
            }));

          setPerformances({
            math: lastThreeMath.reverse(),
            physics: lastThreePhysics.reverse(),
            chemistry: lastThreeChemistry.reverse(),
          });
        } else {
          console.log('No performance data found');
        }
      } catch (error) {
        console.error('Error fetching performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformances();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#6200ea" />;
  }

  if (
    performances.math.length === 0 &&
    performances.physics.length === 0 &&
    performances.chemistry.length === 0
  ) {
    return <Text>No performance data available.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Last 3 Performances</Text>

      {/* Mathematics */}
      <View style={styles.subjectContainer}>
        <Text style={styles.subjectTitle}>Mathematics</Text>
        {performances.math.map((performance, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.label}>Performance {index + 1}:</Text>
            <Text style={styles.value}>{performance.score}</Text>
            <Text style={styles.timestamp}>{performance.timestamp}</Text>
          </View>
        ))}
      </View>

      {/* Physics */}
      <View style={styles.subjectContainer}>
        <Text style={styles.subjectTitle}>Physics</Text>
        {performances.physics.map((performance, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.label}>Performance {index + 1}:</Text>
            <Text style={styles.value}>{performance.score}</Text>
            <Text style={styles.timestamp}>{performance.timestamp}</Text>
          </View>
        ))}
      </View>

      {/* Chemistry */}
      <View style={styles.subjectContainer}>
        <Text style={styles.subjectTitle}>Chemistry</Text>
        {performances.chemistry.map((performance, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.label}>Performance {index + 1}:</Text>
            <Text style={styles.value}>{performance.score}</Text>
            <Text style={styles.timestamp}>{performance.timestamp}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subjectContainer: {
    width: '90%',
    marginBottom: 20,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6200ea',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    color: '#6200ea',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
});

export default PerformanceDisplay;