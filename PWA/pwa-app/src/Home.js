import React, { useState } from "react";
import Button from 'react-bootstrap/Button';

export default function Home() {
  const [preview, setPreview] = useState(null);

  // Open camera
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoElement = document.querySelector("#cameraView");
      videoElement.srcObject = stream;
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  // Open gallery
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imgURL = URL.createObjectURL(file);
      setPreview(imgURL);
    }
  };

  return (
    <div>
      <h1>Home</h1>

      {/* Camera */}
      <Button variant = "success" onClick={openCamera}>Open Camera</Button>
      <br />
      <video id="cameraView" autoPlay playsInline width="300"></video>

      <hr />

      {/* Gallery */}
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && (
        <div>
          <h3>Selected Image:</h3>
          <img src={preview} alt="preview" width="200" />
        </div>
      )}
    </div>
  );
}
