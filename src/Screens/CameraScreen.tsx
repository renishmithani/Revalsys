import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';
import Video from 'react-native-video';
import GetLocation from 'react-native-get-location';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import Compressor from 'react-native-compressor';
import FullScreenLoaderModal from '../components/FullScreenLoader';

const getCurrentTime = () => {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};

console.log(getCurrentTime()); // Example output: "13:15:18"

export default function CameraScreen() {
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraVideoData, setCameraVideoData] = useState(null);
  const [time, setTime] = useState('');
  const [locationData, setLocationData] = useState(null);
  const [address, setAddress] = useState(null);

  const [isCompressing, setIsCompressing] = useState({ load: false, progg: 0 });
  const [isSavingVideo, setIsSavingVideo] = useState(false);

  const {
    hasPermission: hasCameraPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();
  const {
    hasPermission: hasMicPermission,
    requestPermission: requestMicPermission,
  } = useMicrophonePermission();

  const handleCaptureVideo = async () => {
    if (cameraRef?.current) {
      setIsRecording(true);
      cameraRef.current?.startRecording({
        flash: 'off',
        onRecordingFinished: video => {
          console.log('Video saved:', video);
          setCameraVideoData(video);
          setIsRecording(false);
        },
        onRecordingError: error => {
          setIsRecording(false);
        },
      });
    }
  };

  async function hasAndroidPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    if (Platform.Version >= 33) {
      // Android 13+ (API 33)
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      );
      if (hasPermission) return true;

      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      );
      return status === PermissionsAndroid.RESULTS.GRANTED;
    }

    if (Platform.Version >= 29) {
      // Android 10–12
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
      if (hasPermission) return true;

      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
      return status === PermissionsAndroid.RESULTS.GRANTED;
    }

    // Android 9 and below
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    if (hasPermission) return true;

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    return status === PermissionsAndroid.RESULTS.GRANTED;
  }

  const handleSaveVideo = async (path: string) => {
    try {
      if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
        Alert.alert('Permission denied', 'Storage permission is required.');
        return;
      }

      const fileUri = `file://${path}`;
      setIsCompressing({ load: true, progg: 0 });
      const compressResult = await Compressor.Video.compress(
        fileUri,
        {},
        progress => {
          const percent = Math.round(progress * 100); // convert 0-1 to 0-100
          console.log('Percentage==========>', percent);
          setIsCompressing({ load: true, progg: percent });
        },
      );
      setIsCompressing({ load: false, progg: 0 });
      setIsSavingVideo(true);
      console.log(compressResult);
      const compressUrl = compressResult?.startsWith('file://')
        ? compressResult
        : `file://${compressResult}`;
      console.log(compressUrl);
      const savedUri = await CameraRoll.save(compressUrl, { type: 'video' });
      setIsSavingVideo(false);
      Alert.alert('Success', 'Video saved to gallery!');
      setCameraVideoData(null);
      console.log('Saved to gallery:', savedUri);
    } catch (e) {
      Alert.alert('Error', 'Failed to save video to gallery.');
      console.error('Error saving video:', e);
    } finally {
      setIsSavingVideo(false);
      setIsCompressing({ load: false, progg: 0 });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTime(`${hours}:${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  useEffect(() => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
      .then((location: any) => {
        console.log(location);
        setLocationData(location);

        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}`,
          {
            headers: {
              'User-Agent': 'MyReactNativeApp/1.0', // required
              Accept: 'application/json', // ensure JSON response
            },
          },
        )
          .then(res => res.json())
          .then(data => {
            setAddress(
              `${data?.address?.city}, ${data?.address?.state}, ${data?.address?.country}`,
            );
          })
          .catch(err => {
            console.log('fetch error', err);
          });
      })
      .catch(error => {
        const { code, message } = error;
        console.warn(code, message);
      });
  }, [isRecording]); // ✅ fixed dependency array

  // If either permission is missing
  if (!hasCameraPermission || !hasMicPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Permissions Required</Text>
        {!hasCameraPermission && <Text>No camera permission</Text>}
        {!hasMicPermission && <Text>No microphone permission</Text>}
        <Button
          title="Request Permissions"
          onPress={async () => {
            if (!hasCameraPermission) {
              await requestCameraPermission();
            }
            if (!hasMicPermission) {
              await requestMicPermission();
            }
          }}
        />
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No Camera Device Found</Text>
      </View>
    );
  }

  if (cameraVideoData) {
    return (
      <View>
        <FullScreenLoaderModal loading={isCompressing?.load || isSavingVideo}>
          {/* <FullScreenLoaderModal loading={true}> */}
          <Text style={{ color: '#FFFF', fontSize: 24, textAlign: 'center' }}>
            {isCompressing?.load
              ? `Video Compressing ${Math.round(isCompressing?.progg)}%`
              : 'Saving...'}
          </Text>
        </FullScreenLoaderModal>
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 50,
            right: 10,
            backgroundColor: 'red',
            zIndex: 999,
            padding: 10,
            borderRadius: 200,
          }}
        >
          <Text
            style={{ color: '#FFFFFF' }}
            onPress={() => setCameraVideoData(null)}
          >
            X
          </Text>
        </TouchableOpacity>
        <Video
          source={{ uri: `file:///${cameraVideoData?.path}` }}
          style={{ width: '100%', height: '100%' }}
        />
        <TouchableOpacity
          onPress={() => handleSaveVideo(cameraVideoData?.path)}
          style={{
            position: 'absolute',
            zIndex: 999,
            backgroundColor: 'skyblue',
            padding: 20,
            bottom: 30,
            alignSelf: 'center',
            paddingHorizontal: 80,
          }}
        >
          <Text style={{ color: '#FFFFFF' }}>Save to gallery</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        video={true} // 👈 important for recording
        audio={true} // 👈 enable audio recording
      />
      <View
        style={{
          position: 'absolute',
          bottom: 80,
          zIndex: 9999,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
        }}
      >
        {/* {isRecording ? ( */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 18 }}>
            Address: {address || 'Not Allowed'}
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 18 }}>
            Latitude: {locationData?.latitude || 0}
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 18 }}>
            Longitude: {locationData?.longitude || 0}
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 18 }}>
            Time Stamp: {time}
          </Text>
        </View>
        {/* ) : null} */}
        <TouchableOpacity
          style={{
            backgroundColor: 'white',
            padding: 35,
            borderRadius: 200,
            alignItems: 'center',
            borderWidth: 7,
            borderColor: 'black',
          }}
          onLongPress={() => {
            handleCaptureVideo();
          }}
          onPressOut={() => {
            console.log('Stop recording...');
            cameraRef.current?.stopRecording();
          }}
        ></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
