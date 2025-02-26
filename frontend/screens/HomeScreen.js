import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { Card, Text, TouchableRipple } from 'react-native-paper';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const CARD_SIZE = width * 0.42; // 42% of screen width for uniform sizing

const HomeScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setFullName(userDoc.data().fullName);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#6200ea" />
      ) : (
        <>
          <Text variant="headlineLarge" style={styles.title}>
            Welcome, {fullName || 'User'} 👋
          </Text>

          <View style={styles.cardContainer}>
            <CardItem 
              icon="school" 
              title="Academic Performance" 
              subtitle="Track your progress" 
              onPress={() => navigation.navigate('Academic')} 
            />
            <CardItem 
              icon="music" 
              title="Music" 
              subtitle="Listen & explore" 
              onPress={() => navigation.navigate('Music')} 
            />
          </View>

          <View style={styles.cardContainer}>
            <CardItem 
              icon="heart-pulse" 
              title="Stress" 
              subtitle="Manage & relax" 
              onPress={() => navigation.navigate('Stress')} 
            />
            <CardItem 
              icon="help-circle-outline" 
              title="Help" 
              subtitle="Support & FAQs" 
              onPress={() => navigation.navigate('Help')} 
            />
          </View>
        </>
      )}
    </ScrollView>
  );
};

const CardItem = ({ icon, title, subtitle, onPress }) => (
  <TouchableRipple onPress={onPress} rippleColor="rgba(0, 0, 0, .1)" style={styles.card}>
    <Card style={styles.cardContent}>
      <Card.Content style={styles.cardInner}>
        <Icon name={icon} size={50} color="#6200ea" style={styles.icon} />
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </Card.Content>
    </Card>
  </TouchableRipple>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 10,
  },
  cardContent: {
    flex: 1,
    backgroundColor: '#fff',
    elevation: 3,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  cardInner: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  icon: {
    marginBottom: 8,
  },
  cardTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 4,
  },
  cardSubtitle: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
  },
});

export default HomeScreen;
