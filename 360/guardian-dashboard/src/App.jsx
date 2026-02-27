import { useState, useEffect } from "react";

function App() {
  const [alert, setAlert] = useState(false);
  const [timer, setTimer] = useState(30);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (alert && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [alert, timer]);

  const triggerAlert = () => {
    setAlert(true);
    setTimer(30);

    const newIncident = {
      date: "Today",
      name: "Mr Sharma",
      risk: "92%",
      status: "Prevented"
    };

    setHistory((prev) => [newIncident, ...prev]);
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>🛡️ GuardianLink Emergency Dashboard</h1>

      <button
        onClick={triggerAlert}
        style={{
          padding: "12px 20px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginTop: "20px"
        }}
      >
        Simulate Digital Arrest Alert
      </button>

      {alert ? (
        <div style={{
          background: "red",
          color: "white",
          padding: "25px",
          marginTop: "25px",
          borderRadius: "10px"
        }}>
          <h2>🚨 HIGH RISK SCAM DETECTED</h2>
          <p><strong>Senior:</strong> Mr. Sharma (Age 68)</p>
         <p>
  <strong>Risk Score:</strong>{" "}
  <span style={{
    background: "black",
    padding: "5px 10px",
    borderRadius: "5px",
    fontWeight: "bold"
  }}>
    92% (HIGH RISK)
  </span>
</p>
          <p><strong>Call Duration:</strong> 14 minutes</p>
          <p><strong>Bank Freeze Countdown:</strong> {timer} seconds</p>
        </div>
      ) : (
        <div style={{
          background: "#f2f2f2",
          padding: "20px",
          marginTop: "25px",
          borderRadius: "10px"
        }}>
          ✅ System Monitoring Active — No Threat Detected
        </div>
      )}

      {/* Incident History */}
      <div style={{ marginTop: "40px" }}>
        <h2>📜 Incident History</h2>

        {history.length === 0 ? (
          <p>No incidents recorded yet.</p>
        ) : (
          <table border="1" width="100%" cellPadding="10">
            <thead>
              <tr>
                <th>Date</th>
                <th>Senior</th>
                <th>Risk</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>{item.name}</td>
                  <td>{item.risk}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

export default App;