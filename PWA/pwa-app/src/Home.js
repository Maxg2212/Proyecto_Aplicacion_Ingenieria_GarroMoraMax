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

export default function Home() {
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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
      // 1. Load model
      const session = await ort.InferenceSession.create("/modelo_finalori.onnx"); //Usar modelo_finalori.onnx o modelofinalalt.onnx

      // 2. Load image
      const image = new Image();
      image.src = imageSrc;
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      // 3. Prepare image (224x224)
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, 224, 224);
      ctx.drawImage(image, 0, 0, 224, 224);
      
      // 4. Get image data
      const imageData = ctx.getImageData(0, 0, 224, 224);
      const data = imageData.data;
      
      // 5. Create tensor - SIMPLE: 0-255 range, RGB order, shape [1, 224, 224, 3]
      const tensorData = new Float32Array(1 * 224 * 224 * 3);
      let index = 0;
      
      for (let i = 0; i < data.length; i += 4) {
        tensorData[index++] = data[i];       // R (0-255)
        tensorData[index++] = data[i + 1];   // G (0-255)
        tensorData[index++] = data[i + 2];   // B (0-255)
        // Skip alpha channel
      }

      const inputTensor = new ort.Tensor("float32", tensorData, [1, 224, 224, 3]);

      // 6. Run model
      const feeds = { "input": inputTensor };
      const results = await session.run(feeds);
      const output = results["dense_1"].data;
      
      // 7. Get predictions
      const expScores = output.map(score => Math.exp(score));
      const sumExp = expScores.reduce((a, b) => a + b, 0);
      const probabilities = expScores.map(score => score / sumExp);
      
      // 8. Find best prediction
      let maxProb = 0;
      let maxIndex = 0;
      probabilities.forEach((prob, index) => {
        if (prob > maxProb) {
          maxProb = prob;
          maxIndex = index;
        }
      });
      
      const confidence = (maxProb * 100).toFixed(2);
      const label = LABELS[maxIndex];
      
      setPrediction({ 
        label, 
        confidence,
        allProbabilities: probabilities.map((p, i) => ({
          label: LABELS[i],
          probability: (p * 100).toFixed(2)
        })).sort((a, b) => b.probability - a.probability)
      });
      
    } catch (error) {
      console.error("Error:", error);
      setPrediction({ 
        label: "Error", 
        confidence: "0",
        error: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem", padding: "1rem" }}>
      <h1>Tree Species Classifier </h1>

      <div style={{ marginBottom: "2rem" }}>
        <h3>Upload a tree image:</h3>
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
            style={{ border: "1px solid #ccc", borderRadius: "8px" }}
          />
        </div>
      )}

      <canvas ref={canvasRef} width="224" height="224" style={{ display: "none" }} />

      {loading && <p>Analyzing tree species...</p>}

      {prediction && !loading && (
        <div style={{ 
          marginTop: "1.5rem", 
          padding: "1.5rem", 
          backgroundColor: "#f8f9fa", 
          borderRadius: "8px",
          border: "1px solid #dee2e6"
        }}>
          {prediction.error ? (
            <div>
              <h3 style={{ color: "#dc3545" }}>Error</h3>
              <p>{prediction.error}</p>
            </div>
          ) : (
            <>
              <h3>Prediction Result:</h3>
              <p style={{ fontSize: "1.2rem" }}>
                <strong>Species:</strong> {prediction.label}<br />
                <strong>Confidence:</strong> {prediction.confidence}%
              </p>
              
              <h4>Top Predictions:</h4>
              {prediction.allProbabilities.slice(0, 3).map((item, index) => (
                <div key={index} style={{ 
                  margin: "0.5rem 0",
                  padding: "0.5rem",
                  backgroundColor: index === 0 ? "#e7f3ff" : "transparent",
                  borderRadius: "4px"
                }}>
                  {index + 1}. {item.label}: {item.probability}%
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}