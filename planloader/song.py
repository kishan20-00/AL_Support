import firebase_admin
from firebase_admin import credentials, firestore, storage
import os

# Initialize Firebase Admin SDK
cred = credentials.Certificate("key.json")  # Replace with your key.json path
firebase_admin.initialize_app(cred, {
    'storageBucket': 'alsupport-c7bf0.firebasestorage.app'  # Replace with your Firebase project ID
})
db = firestore.client()
bucket = storage.bucket()

# Folder containing playlists and songs
songs_folder = "songs"
playlists_folder = "playlist"

# Function to parse the playlist file into a list of songs
def parse_playlist(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        songs = file.read().strip().split(", ")
    return songs

# Iterate through playlist folders
for playlist_name in os.listdir(songs_folder):
    playlist_path = os.path.join(songs_folder, playlist_name)
    playlist_file = os.path.join(playlists_folder, f"{playlist_name}.txt")
    
    if os.path.isdir(playlist_path) and os.path.exists(playlist_file):  # Ensure it's a directory and has a txt file
        song_titles = parse_playlist(playlist_file)
        song_data = []
        
        # Iterate through songs inside the playlist folder
        for song_file in os.listdir(playlist_path):
            if song_file.endswith(".mp3"):  # Ensure it's an MP3 file
                song_name = os.path.splitext(song_file)[0]  # Extract song name
                
                if song_name in song_titles:  # Ensure the song is in the txt file
                    song_path = os.path.join(playlist_path, song_file)
                    
                    # Upload to Firebase Storage
                    blob = bucket.blob(f"songs/{playlist_name}/{song_file}")
                    blob.upload_from_filename(song_path)
                    blob.make_public()
                    
                    # Get public URL
                    song_url = blob.public_url
                    
                    # Store song info
                    song_data.append({"name": song_name, "url": song_url})
                    print(f"✅ Uploaded: {song_file} in {playlist_name}")
        
        # Upload playlist data to Firestore
        db.collection("Playlists").document(playlist_name).set({"songs": song_data})
        print(f"🎶 Uploaded playlist {playlist_name} with {len(song_data)} songs.")

print("🎉 Process complete.")