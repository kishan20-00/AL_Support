import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Card, Text, TouchableRipple } from "react-native-paper";
import { auth, db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9;

const stressLevels = {
  Normal: "😊",
  Mild: "😐",
  Moderate: "😟",
  Severe: "😞",
};

const climates = {
  Sunny: "☀️",
  Rainy: "🌧️",
};

// Color palette for feature cards
const cardColors = {
  Academic: "#E3F2FD", // Light blue
  Music: "#F3E5F5", // Light purple
  Stress: "#FFEBEE", // Light red
  Emotion: "#E8F5E9", // Light green
};

const HomeScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [stressLevel, setStressLevel] = useState(null);
  const [climate, setClimate] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setFullName(userDoc.data().fullName);
        }

        const stressDocRef = doc(db, "stresslevel", user.email);
        const stressDoc = await getDoc(stressDocRef);

        if (stressDoc.exists()) {
          const predictions = stressDoc.data().predictions || [];
          if (predictions.length > 0) {
            const latestPrediction = predictions[predictions.length - 1];
            setStressLevel(latestPrediction.predictedClass || "Unknown");
          }
        }

        const climateRef = collection(db, "musicpredict");
        const climateQuery = query(climateRef, where("email", "==", user.email));
        const climateSnapshot = await getDocs(climateQuery);
        if (!climateSnapshot.empty) {
          const climateData = climateSnapshot.docs[0].data();
          setClimate(climateData.weather);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ea" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Text style={styles.greeting}>Hi, {fullName  || "User"}</Text>
      <Text style={styles.subtitle}>Let's check your activity</Text>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <StatCard 
          title="Stress Level" 
          value={stressLevel} 
          emoji={stressLevels[stressLevel] || "🤔"}
        />
        <StatCard 
          title="Climate" 
          value={climate} 
          emoji={climates[climate] || "🌤️"}
        />
      </View>

      {/* Feature Cards */}
      <View style={styles.cardRow}>
        <FeatureCard
          icon="school"
          title="Academic"
          subtitle="Track progress"
          color={cardColors.Academic}
          onPress={() => navigation.navigate("Academic")}
        />
        <FeatureCard
          icon="music"
          title="Music"
          subtitle="Listen & explore"
          color={cardColors.Music}
          onPress={() => navigation.navigate("Music")}
        />
      </View>

      <View style={styles.cardRow}>
        <FeatureCard
          icon="heart-pulse"
          title="Stress"
          subtitle="Manage & relax"
          color={cardColors.Stress}
          onPress={() => navigation.navigate("Stress")}
        />
        <FeatureCard
          icon="emoticon-wink"
          title="Emotion"
          subtitle="Find peace"
          color={cardColors.Emotion}
          onPress={() => navigation.navigate("Audio")}
        />
      </View>

      {/* Motivation Banner */}
      <View style={styles.motivationCard}>
        <Text style={styles.motivationText}>Keep the progress!</Text>
        <Text style={styles.motivationSubtext}>You're doing great</Text>
      </View>
    </ScrollView>
  );
};

const StatCard = ({ title, value, emoji }) => (
  <View style={[styles.statCard, styles.shadow]}>
    <Text style={styles.statTitle}>{title}</Text>
    <View style={styles.statValueContainer}>
      <Text style={styles.statValue}>{value || "--"}</Text>
      <Text style={styles.statEmoji}>{emoji}</Text>
    </View>
  </View>
);

const FeatureCard = ({ icon, title, subtitle, color, onPress }) => (
  <TouchableRipple 
    onPress={onPress} 
    style={[styles.featureCard, styles.shadow, { backgroundColor: color }]}
  >
    <View style={styles.featureContent}>
      <Icon name={icon} size={30} color="#6200ea" style={styles.featureIcon} />
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureSubtitle}>{subtitle}</Text>
    </View>
  </TouchableRipple>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 25,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statCard: {
    width: CARD_WIDTH / 2 - 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 15,
  },
  statTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  statValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statEmoji: {
    fontSize: 24,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  featureCard: {
    width: CARD_WIDTH / 2 - 10,
    borderRadius: 12,
    padding: 15,
    height: 150,
  },
  featureContent: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  featureIcon: {
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  featureSubtitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  motivationCard: {
    backgroundColor: "#6200ea",
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  motivationText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  motivationSubtext: {
    fontSize: 14,
    color: "#e6e1ff",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default HomeScreen;