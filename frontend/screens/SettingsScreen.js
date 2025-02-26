import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';

// Settings Screen
const SettingsScreen = () => (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>Settings</Text>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="bodyMedium">Modify your application preferences here.</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 20,
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
    },
    title: {
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    card: {
      width: '90%',
      padding: 20,
      backgroundColor: '#fff',
      elevation: 3,
    },
  });

export default SettingsScreen;