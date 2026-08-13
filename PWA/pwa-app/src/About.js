// About.js
import React from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';

export default function About() {
  return (
    <Container style={{ marginTop: '2rem' }}>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h2>About Tree Identifier</h2>
            </Card.Header>
            <Card.Body>
              <p>
                <strong>Tree Identifier</strong> is an CNN-powered web application 
                that helps you identify tree species from images using machine learning.
              </p>
              
              <h5>How it works:</h5>
              <ul>
                <li>Upload an image of a tree or use your camera</li>
                <li>Our Continuous Neural Network analyzes the image using computer vision</li>
                <li>Get instant species identification with accuracy percentage</li>
                <li>View your identification history anytime</li>
              </ul>

              <h5>Technology:</h5>
              <ul>
                <li><strong>Frontend:</strong> React.js with Bootstrap</li>
                <li><strong>Continuous learning model:</strong> Xception neural network trained on tree species</li>
                <li><strong>Format:</strong> ONNX model for efficient browser inference</li>
                <li><strong>Data Storage:</strong> Local browser storage for your history</li>
              </ul>

              <h5>Supported Tree Species:</h5>
              <p>
                Our model can identify 23 different tree species including Acer palmatum, 
                Cedrus deodara, Ginkgo biloba, and many more urban street trees.
              </p>

              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '1rem', 
                borderRadius: '8px',
                marginTop: '1.5rem'
              }}>
                <p style={{ margin: 0, fontStyle: 'italic' }}>
                  This application is designed for educational and identification purposes. 
                  For professional botanical identification, please consult with experts.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}