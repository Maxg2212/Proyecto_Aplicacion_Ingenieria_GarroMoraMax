import React, { useState, useRef } from "react";
import Button from "react-bootstrap/Button";
import * as ort from "onnxruntime-web";

const LABELS = [
  'Acer palmatum',
  'Cedrus deodara', 
  'Celtis sinensis',
  'Cinnamomum camphora (Linn) Presl',
  'Elaeocarpus decipiens',
  'Flowering cherry',
  'Ginkgo biloba',
  'Koelreuteria paniculata',
  'Lagerstroemia indica',
  'Liquidambar formosana',
  'Liriodendron chinense',
  'Magnolia grandiflora L',
  'Magnolia liliflora Desr',
  'Michelia chapensis',
  'Osmanthus fragrans',
  'Photinia serratifolia',
  'Platanus',
  'Prunus cerasifera f. atropurpurea',
  'Salix babylonica',
  'Sapindus saponaria',
  'Styphnolobium japonicum',
  'Triadica sebifera',
  'Zelkova serrata'
];

export default function Home({ addToHistory }) {
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoElement = videoRef.current;
      videoElement.srcObject = stream;
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  const captureImage = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    ctx.drawImage(video, 0, 0, 224, 224);
    const dataURL = canvas.toDataURL("image/png");
    setPreview(dataURL);
    await runModel(dataURL);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imgURL = URL.createObjectURL(file);
      setPreview(imgURL);
      await runModel(imgURL);
    }
  };

  const runModel = async (imageSrc) => {
    setLoading(true);
    setPrediction(null);
    
    try {
      const session = await ort.InferenceSession.create("/modelo_final.onnx");

      const image = new Image();
      image.src = imageSrc;
      await new Promise((resolve) => (image.onload = resolve));

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const SIZE = 224;
      
      ctx.drawImage(image, 0, 0, SIZE, SIZE);
      const imgData = ctx.getImageData(0, 0, SIZE, SIZE);

      const data = Float32Array.from(imgData.data)
        .filter((_, i) => i % 4 !== 3);

      const inputTensor = new ort.Tensor("float32", data, [1, SIZE, SIZE, 3]);
      const feeds = { input: inputTensor };
      const output = await session.run(feeds);
      const outputName = Object.keys(output)[0];
      const result = output[outputName].data;

      const exp = result.map((v) => Math.exp(v));
      const sum = exp.reduce((a, b) => a + b, 0);
      const probs = exp.map((v) => v / sum);

      // Debug: print the full softmax vector
      console.log("=== Softmax Probabilities ===");
      LABELS.forEach((label, i) => {
        console.log(`${label.padEnd(35)}: ${probs[i].toFixed(6)}`);
      });
      console.log("=============================");

      const maxIdx = probs.indexOf(Math.max(...probs));
      const predictedLabel = LABELS[maxIdx];
      const accuracy_cal = (probs[maxIdx] * 1000).toFixed(1);
      const accuracy = (accuracy_cal >= 100) ? 100 : accuracy_cal;
      
      // Show raw math too
      console.log("Predicted index:", maxIdx);
      console.log("Predicted label:", predictedLabel);
      console.log("Confidence (prob * 1000):", accuracy, "%");
      console.log("Raw sum of exp() terms:", sum);

      // Create history item
      const historyItem = {
        species: predictedLabel,
        accuracy: accuracy,
        timestamp: new Date().toLocaleString()
      };

      // Save to history if addToHistory function is provided
      if (addToHistory) {
        addToHistory(historyItem);
      }

      setPrediction({ 
        label: predictedLabel, 
        accuracy: accuracy
      });
    } catch (err) {
      console.error("Model inference error:", err);
      setPrediction({ 
        label: "Error", 
        accuracy: "0",
        error: err.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem", padding: "1rem" }}>
      <h1>Tree Species Classification</h1>

      <div style={{ marginBottom: "2rem" }}>
        <Button 
          variant="success" 
          onClick={openCamera}
          style={{ marginRight: "1rem" }}
        >
          Open Camera
        </Button>
        <Button 
          variant="primary" 
          onClick={captureImage}
          disabled={!videoRef.current?.srcObject}
        >
          Capture Image
        </Button>
        <br />
        <video 
          id="cameraView" 
          ref={videoRef} 
          autoPlay 
          playsInline 
          width="300" 
          style={{ border: "1px solid #ccc", marginTop: "1rem" }}
        />
      </div>

      <hr />

      <div style={{ marginBottom: "2rem" }}>
        <h3>Or upload an image:</h3>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          disabled={loading}
        />
      </div>

      {preview && (
        <div style={{ marginBottom: "2rem" }}>
          <h3>Selected Image:</h3>
          <img 
            src={preview} 
            alt="preview" 
            width="224" 
            height="224" 
            style={{ 
              border: "1px solid #ccc", 
              borderRadius: "8px",
              objectFit: "cover"
            }}
          />
        </div>
      )}

      <canvas 
        ref={canvasRef} 
        width="224" 
        height="224" 
        style={{ display: "none" }} 
      />

      {loading && (
        <div style={{ margin: "2rem 0" }}>
          <p>Analyzing tree species...</p>
        </div>
      )}

      {prediction && !loading && (
        <div style={{ marginTop: "1.5rem" }}>
          <h3>Identification Result</h3>
          <div style={{
            backgroundColor: "#f8f9fa",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
            display: "inline-block",
            minWidth: "300px",
            textAlign: "center"
          }}>
            <p style={{ 
              fontSize: "1.3rem", 
              margin: "0 0 0.5rem 0",
              fontWeight: "bold",
              color: "#212529"
            }}>
              Species: {prediction.label}
            </p>
            <p style={{ 
              fontSize: "1.1rem", 
              margin: 0,
              color: "#495057"
            }}>
              Accuracy: {prediction.accuracy}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}