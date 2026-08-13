import React, { useState, useRef } from "react";
import Button from "react-bootstrap/Button";
import * as ort from "onnxruntime-web";
import EXIF from 'exif-js';

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

// EXIF location extraction
const convertDMSToDD = (dms, ref) => {
  if (!dms) return null;
  const degrees = dms[0];
  const minutes = dms[1];
  const seconds = dms[2];
  let dd = degrees + (minutes / 60) + (seconds / 3600);
  if (ref === 'S' || ref === 'W') dd = dd * -1;
  return parseFloat(dd.toFixed(6));
};

const getLocationFromImage = (file) => {
  return new Promise((resolve) => {
    EXIF.getData(file, function() {
      try {
        const lat = EXIF.getTag(this, 'GPSLatitude');
        const latRef = EXIF.getTag(this, 'GPSLatitudeRef');
        const lng = EXIF.getTag(this, 'GPSLongitude');
        const lngRef = EXIF.getTag(this, 'GPSLongitudeRef');
        
        if (lat && lng && latRef && lngRef) {
          const latitude = convertDMSToDD(lat, latRef);
          const longitude = convertDMSToDD(lng, lngRef);
          resolve({ 
            latitude, 
            longitude,
            source: 'image_metadata'
          });
        } else {
          resolve(null);
        }
      } catch (error) {
        resolve(null);
      }
    });
  });
};

export default function Home({ addToHistory }) {
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imgURL = URL.createObjectURL(file);
      setPreview(imgURL);
      
      // Extract location from image EXIF data only
      let location = null;
      try {
        location = await getLocationFromImage(file);
      } catch (error) {
        console.log('Error extracting location from EXIF:', error);
      }
      
      await runModel(imgURL, location);
    }
  };

  const runModel = async (imageSrc, location) => {
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

      const maxIdx = probs.indexOf(Math.max(...probs));
      const predictedLabel = LABELS[maxIdx];
      const accuracy_cal = (probs[maxIdx] * 1000).toFixed(1);
      const accuracy = (accuracy_cal >= 100) ? 100 : accuracy_cal;

      const historyItem = {
        species: predictedLabel,
        accuracy: accuracy,
        timestamp: new Date().toLocaleString(),
        location: location
      };

      if (addToHistory) {
        addToHistory(historyItem);
      }

      setPrediction({ 
        label: predictedLabel, 
        accuracy: accuracy,
        location: location
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
        <h3>Upload a tree image:</h3>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          disabled={loading}
        />
        <div style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.5rem" }}>
          Location will be extracted from image EXIF data if available
        </div>
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

      <canvas ref={canvasRef} width="224" height="224" style={{ display: "none" }} />

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
            {prediction.location ? (
              <p style={{ 
                fontSize: "0.9rem", 
                margin: "0.5rem 0 0 0",
                color: "#28a745"
              }}>
                Location: {prediction.location.latitude.toFixed(4)}, {prediction.location.longitude.toFixed(4)}
              </p>
            ) : (
              <p style={{ 
                fontSize: "0.9rem", 
                margin: "0.5rem 0 0 0",
                color: "#6c757d",
                fontStyle: "italic"
              }}>
                No location data in image
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}