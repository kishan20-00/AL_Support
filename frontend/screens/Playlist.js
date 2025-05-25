import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Button } from 'react-native';
import { Audio } from 'expo-av';
import { auth, db } from '../firebaseConfig';
import { getDoc, doc } from 'firebase/firestore';

const PlaylistScreen = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playlistName, setPlaylistName] = useState('');
  const [sound, setSound] = useState(null);
  const [playingSong, setPlayingSong] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    fetchPlaylist();
  }, []);

  useEffect(() => {
    let interval;
    if (playingSong !== null && sound) {
      interval = setInterval(async () => {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setPosition(status.positionMillis);
          setDuration(status.durationMillis || 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [playingSong, sound]);

  const fetchPlaylist = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userEmail = user.email;
        const predictDocRef = doc(db, 'musicpredict', userEmail);
        const predictDoc = await getDoc(predictDocRef);

        if (predictDoc.exists()) {
          const recommendedPlaylist = predictDoc.data().recommendedPlaylist; // Directly get the playlist number
          const playlistDocRef = doc(db, 'Playlists', recommendedPlaylist.toString()); // Convert to string for Firestore
          const playlistDoc = await getDoc(playlistDocRef);

          if (playlistDoc.exists()) {
            setSongs(playlistDoc.data().songs);
            setPlaylistName(`Playlist ${recommendedPlaylist}`);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const playSong = async (songUrl, songIndex) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: songUrl },
        { shouldPlay: true }
      );
      setSound(newSound);
      setPlayingSong(songIndex);
    } catch (error) {
      console.error('Error playing song:', error);
    }
  };

  const stopSong = async () => {
    if (sound) {
      await sound.stopAsync();
      setPlayingSong(null);
      setPosition(0);
    }
  };

  // Helper function to format milliseconds into minutes and seconds
  const formatTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{playlistName || 'Your Playlist'} 🎵</Text>
      {songs.length > 0 ? (
        songs.map((song, index) => (
          <View key={index} style={styles.songBox}>
            <Text style={styles.songText}>{song.name}</Text>
            <Button title="Play" onPress={() => playSong(song.url, index)} />
            {playingSong === index && <Button title="Stop" onPress={stopSong} />}
            {playingSong === index && (
              <Text style={styles.timeText}>
                {formatTime(position)} / {formatTime(duration)}
              </Text>
            )}
          </View>
        ))
      ) : (
        <Text style={styles.noSongsText}>No songs found in this playlist.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  songBox: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  songText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },
  noSongsText: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default PlaylistScreen;