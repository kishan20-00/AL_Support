import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { API_ENDPOINTS } from '../config/api';

const REQUEST_TIMEOUT = 10000;
const CACHE_DURATION = 30000;

const api = axios.create({
  timeout: REQUEST_TIMEOUT,
  // headers: {
  //   'Content-Type': 'multipart/form-data',
  // },
});

let healthCheckCache = null;

/**
 * Check if the backend server is healthy
 */
export const checkServerHealth = async () => {
  if (healthCheckCache && Date.now() - healthCheckCache.timestamp < CACHE_DURATION) {
    return healthCheckCache.data;
  }

  try {
    const response = await api.get(API_ENDPOINTS.HEALTH);
    healthCheckCache = {
      data: response.data,
      timestamp: Date.now(),
    };
    return response.data;
  } catch (error) {
    console.error('Error checking server health:', error);
    throw error;
  }
};

/**
 * Helper function to create form data with file
 */
const createFormData = async (fileUri, fieldName, fileName, mimeType) => {
  const fileInfo = await FileSystem.getInfoAsync(fileUri);

  if (!fileInfo.exists) {
    throw new Error(`${mimeType.split('/')[0]} file does not exist`);
  }

  const formData = new FormData();
  formData.append(fieldName, {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  });

  return formData;
};

/**
 * Predict emotion from a face image
 * @param {string} imageUri - URI of the image to analyze
 * @returns {Promise<Object>} Promise resolving to emotion response
 */
export const predictFaceEmotion = async (imageUri) => {
  try {
    const formData = await createFormData(imageUri, 'image_file', 'image.jpg', 'image/jpeg');
    const response = await api.post(API_ENDPOINTS.PREDICT_FACE, formData);
    return response.data;
  } catch (error) {
    console.error('Error predicting face emotion:', error);
    throw error;
  }
};

/**
 * Predict emotion from an audio file
 * @param {string} audioUri - URI of the audio file to analyze
 * @returns {Promise<Object>} Promise resolving to emotion response
 */
export const predictAudioEmotion = async (audioUri) => {
  try {
    const formData = await createFormData(audioUri, 'audio_file', 'audio.wav', 'audio/wav');
    const response = await api.post(API_ENDPOINTS.PREDICT_AUDIO, formData);
    return response.data;
  } catch (error) {
    console.error('Error predicting audio emotion:', error);
    throw error;
  }
};

/**
 * Process a video file for emotion analysis
 * @param {string} videoUri - URI of the video file to analyze
 * @param {number} sampleRate - Process 1 frame every N frames (default: 5)
 * @returns {Promise<Object>} Promise resolving to video processing response
 */
export const processVideo = async (videoUri, sampleRate = 5) => {
  try {
    const formData = await createFormData(videoUri, 'video_file', 'video.mp4', 'video/mp4');
    formData.append('sample_rate', sampleRate.toString());

    const response = await api.post(API_ENDPOINTS.PROCESS_VIDEO, formData);
    return response.data;
  } catch (error) {
    console.error('Error processing video:', error);
    throw error;
  }
};

const apiService = {
  checkServerHealth,
  predictFaceEmotion,
  predictAudioEmotion,
  processVideo
};

export default apiService;