"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [selectedVfd, setSelectedVfd] = useState("TVE-VFD-00001");
  const canvasRef = useRef(null);
  
  const [vfdData, setVfdData] = useState({
    vfd_id: "Loading...",
    frequency: 0,
    current: 0,
    max_current: 20.0,
    voltage: 380.0,
    temperature: 35.0,
    status: "Initializing"
  });

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:1880/api/vfd-data?id=${selectedVfd}`, { mode: "cors" });
        const data = await response.json();
        if (isMounted) setVfdData(data);
      } catch (error) {
        if (isMounted) {
          let baseFreq = 45, baseAmp = 12.5, maxAmp = 20.0, baseVolt = 380.0, baseTemp = 38.5, machineStatus = "Running";
          if (selectedVfd === "TVE-VFD-00002") {
            baseFreq = 38.2; baseAmp = 8.4; maxAmp = 15.0; baseVolt = 378.5; baseTemp = 42.1; machineStatus = "Running (Eco)";
          } else if (selectedVfd === "TVE-VFD-00003") {
            baseFreq = 49.8; baseAmp = 18.2; maxAmp = 30.0; baseVolt = 382.1; baseTemp = 48.7; machineStatus = "High Load";
          }
          setVfdData({
            vfd_id: selectedVfd,
            frequency: parseFloat((baseFreq + Math.random() * 1.5).toFixed(1)),
            current: parseFloat((baseAmp + Math.random() * 0.8).toFixed(1)),
            max_current: maxAmp, 
            voltage: parseFloat((baseVolt + (Math.random() * 4 - 2)).toFixed(1)),
            temperature: parseFloat((baseTemp + Math.random() * 0.5).toFixed(1)),
            status: machineStatus
          });
        }
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [selectedVfd]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let angleOffset = 0;

    const drawOscillator = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      const baseRadius = 80 + ((vfdData.voltage || 380) - 360) * 0.3; 
      const waveFrequency = (vfdData.frequency || 45) / 10;
      const noiseAmp = (vfdData.current || 12) * 0.5;

      ctx.strokeStyle = "rgba(56, 189, 248, 0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(centerX, centerY, 110, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(centerX, centerY, 55, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(centerX - 130, centerY); ctx.lineTo(centerX + 130, centerY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(centerX, centerY - 130); ctx.lineTo(centerX, centerY + 130); ctx.stroke();

      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i <= 360; i += 2) {
        const angle = (i * Math.PI) / 180;
        const wave = Math.sin(angle * waveFrequency + angleOffset) * noiseAmp;
        const r = baseRadius + wave;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      angleOffset += ((vfdData.frequency || 45) / 50) * 0.1;
      animationFrameId = requestAnimationFrame(drawOscillator);
    };

    drawOscillator();
    return () => cancelAnimationFrame(animationFrameId);
  }, [vfdData]);

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", backgroundColor: "#020617", color: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ borderBottom: "1px solid #1e293b", paddingBottom: "20px", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "26px", color: "#38bdf8", margin: 0 }}>🎛️ Ion Storage Power & VFD Global Fleet Management</h1>
        <p style={{ color: "#64748b", margin: "5px 0 0 0" }}>สถานะมอนิเตอร์ความถี่ไอออนและสัญญาณออสซิเลเตอร์โครงข่ายไฟฟ้า</p>
      </div>

      <div style={{ marginBottom: "25px", display: "flex", alignItems: "center", gap: "12px" }}>
        <label style={{ color: "#94a3b8" }}>เลือกยูนิตพลังงาน:</label>
        <select 
          value={selectedVfd} 
          onChange={(e) => setSelectedVfd(e.target.value)}
          style={{ backgroundColor: "#0f172a", color: "#38bdf8", border: "1px solid #334155", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold" }}
        >
          <option value="TVE-VFD-00001">🔋 Ion Cell Matrix 01</option>
          <option value="TVE-VFD-00002">🔋 Ion Cell Matrix 02</option>
          <option value="TVE-VFD-00003">🔋 Ion Cell Matrix 03</option>
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
        <div style={{ background: "#0f172a", padding: "25px", borderRadius: "16px", border: "1px solid #1e293b", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h3 style={{ color: "#38bdf8", marginTop: 0, fontSize: "14px", letterSpacing: "1px" }}>🟢 WAVE OSCILLATOR MONITOR ({vfdData.vfd_id})</h3>
          <div style={{ width: "300px", height: "300px", margin: "10px 0" }}>
            <canvas ref={canvasRef} width={300} height={300} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          <div style={{ background: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #1e293b" }}>
            <span style={{ color: "#64748b", fontSize: "13px" }}>Frequency</span>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#38bdf8", margin: "10px 0" }}>{vfdData.frequency} Hz</div>
          </div>
          <div style={{ background: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #1e293b" }}>
            <span style={{ color: "#64748b", fontSize: "13px" }}>Voltage</span>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#eab308", margin: "10px 0" }}>{vfdData.voltage} V</div>
          </div>
          <div style={{ background: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #1e293b" }}>
            <span style={{ color: "#64748b", fontSize: "13px" }}>Current Load</span>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#34d399", margin: "10px 0" }}>{vfdData.current} A</div>
          </div>
          <div style={{ background: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #1e293b" }}>
            <span style={{ color: "#64748b", fontSize: "13px" }}>Inverter Temp</span>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#a855f7", margin: "10px 0" }}>{vfdData.temperature} °C</div>
          </div>
          <div style={{ gridColumn: "span 2", background: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #1e293b", textAlign: "center" }}>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#fb923c", marginBottom: "15px" }}>⚡ STATUS: {vfdData.status}</div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button style={{ background: "#16a34a", color: "white", border: "none", padding: "8px 20px", borderRadius: "6px", fontWeight: "bold" }}>RUN</button>
              <button style={{ background: "#dc2626", color: "white", border: "none", padding: "8px 20px", borderRadius: "6px", fontWeight: "bold" }}>STOP</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
