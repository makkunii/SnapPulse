import { useState, useRef } from 'react';

export const useCamera = (facingMode) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermission = async () => {
    try {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: facingMode }, 
        audio: true 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setHasPermission(true);
      return stream;
    } catch (err) {
      setHasPermission(false);
    }
  };

  const takePhoto = () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    if (!video) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (facingMode === "user") { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, 0, 0);
    setPhoto(canvas.toDataURL('image/jpeg', 0.8));
  };

  const startRecording = () => {
    if (!videoRef.current?.srcObject) return;
    const chunks = [];
    mediaRecorderRef.current = new MediaRecorder(videoRef.current.srcObject);
    mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/mp4' });
      const reader = new FileReader();
      reader.readAsDataURL(blob); 
      reader.onloadend = () => setVideoBlob(reader.result);
    };
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return { 
    videoRef, photo, setPhoto, videoBlob, setVideoBlob,
    isRecording, startRecording, stopRecording,
    hasPermission, requestPermission, takePhoto
  };
};