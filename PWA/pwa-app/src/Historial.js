// Historial.js
import React from 'react';
import { Table, Button, Container, Card } from 'react-bootstrap';

export default function Historial({ history, clearHistory }) {
  return (
    <Container style={{ marginTop: '2rem' }}>
      <Card>
        <Card.Header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Identification History</h2>
            {history.length > 0 && (
              <Button 
                variant="outline-danger" 
                onClick={clearHistory}
                size="sm"
              >
                Clear History
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          {history.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6c757d', margin: '2rem 0' }}>
              No identification history yet.
            </p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Species</th>
                  <th>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={index}>
                    <td>{item.timestamp}</td>
                    <td style={{ fontWeight: 'bold' }}>{item.species}</td>
                    <td>{item.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}