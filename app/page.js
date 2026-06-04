"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [selectedVfd, setSelectedVfd] = useState("TVE-VFD-00001");
  const canvasRef = useRef(null);
  
  const [vfdData, setVfdData] = useState({
    vfd_id: "Loading...",
    frequency: 0,
    current: 0,
    max_current: 0,
    voltage: 0,
    temperature: 0,
    status: "Initializing"
  });

  // 1. ดึงข้อมูลพารามิเตอร์ไฟฟ้า
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

  // 2. เอฟเฟกต์วาดวงกลม ออสซิเลเตอร์ (Circular Oscillator Animation) แบบ Real-time
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
      
      // คำนวณรัศมีคลื่นตามแรงดัน และความถี่คลื่นตาม Hz จริงจาก VFD
      const baseRadius = 90 + (vfdData.voltage - 360) * 0.5; 
      const waveFrequency = vfdData.frequency > 0 ? vfdData.frequency / 10 : 4.5;
      const noiseAmp = vfdData.current > 0 ? vfdData.current * 0.8 : 10; // แอมพลิจูดขยับตามกระแสแอมป์

      // วาดเส้นกริดเรดาร์พื้นหลัง
      ctx.strokeStyle = "rgba(56, 189, 248, 0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(centerX, centerY, 120, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(centerX, centerY, 60, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(centerX - 140, centerY); ctx.lineTo(centerX + 140, centerY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(centerX, centerY - 140); ctx.lineTo(centerX, centerY + 140); ctx.stroke();

      // วาดเส้นเรืองแสงออสซิเลเตอร์ วงกลม (Oscillator Line)
      ctx.strokeStyle = "#38bdf8";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#0284c7";
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      for (let i = 0; i <= 360; i += 1) {
        const angle = (i * Math.PI) / 180;
        // สูตรคณิตศาสตร์สร้างคลื่น Sine Wave ม้วนตัวเป็นวงกลม
        const wave = Math.sin(angle * waveFrequency + angleOffset) * noiseAmp;
        const r = baseRadius + wave;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      
      // ล้างค่า Shadow เพื่อไม่ให้กระทบส่วนอื่น
      ctx.shadowBlur = 0;

      // ความเร็วการหมุนคลื่นสอดคล้องกับความถี่มอเตอร์
      angleOffset += (vfdData.frequency / 50) * 0.15;
      animationFrameId = requestAnimationFrame(drawOscillator);
    };

    drawOscillator();
    return () => cancelAnimationFrame(animationFrameId);
  }, [vfdData]);

  return (
    <div style={{ padding: "40px", fontFamily: "'Segoe UI', Roboto, sans-serif", backgroundColor: "#020617", color: "#f8fafc", minHeight: "100vh" }}>
      
      {/* ส่วนหัว */}
      <div style={{ borderBottom: "1px solid #1e293b", paddingBottom: "20px", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", color: "#38bdf8", margin: 0, letterSpacing: "0.5px" }}>🎛️ Ion Storage Power & VFD Global Fleet Management</h1>
        <p style={{ color: "#64748b", margin: "5px 0 0 0" }}>สเตชันมอนิเตอร์ความถี่ไอออนและสัญญาณออสซิเลเตอร์โครงข่ายไฟฟ้า</p>
      </div>

      {/* แผงควบคุมบน */}
      <div style={{ marginBottom: "25px", display: "flex", alignItems: "center", gap: "12px" }}>
        <label style={{ color: "#94a3b8", fontSize: "15px" }}>เลือกยูนิตพลังงาน:</label>
        <select 
          value={selectedVfd} 
          onChange={(e) => setSelectedVfd(e.target.value)}
          style={{ backgroundColor: "#0f172a", color: "#38bdf8", border: "1px solid #334155", padding: "8px 16px", borderRadius: "8px", fontSize: "15px", fontWeight: "bold", cursor: "pointer", outline: "none" }}
        >
          <option value="TVE-VFD-00001">🔋 Ion Cell Matrix 01</option>
          <option value="TVE-VFD-00002">🔋 Ion Cell Matrix 02</option>
          <option value="TVE-VFD-00003">🔋 Ion Cell Matrix 03</option>
        </select>
      </div>

      {/* Main Layout: แบ่งซ้ายโชว์กราฟ ขวาโชว์ตัวเลข */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px", alignItems: "start" }}>
        
        {/* 🔮 หน้าจอออสซิเลเตอร์วงกลม (Oscillator Vector Scope) */}
        <div style={{ background: "radial-gradient(circle, #0f172a 0%, #020617 100%)", padding: "30px", borderRadius: "16px", border: "1px solid #1e293b", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)" }}>
          <h3 style={{ color: "#38bdf8", marginTop: 0, fontSize: "15px", textTransform: "uppercase", letterSpacing: "1px" }}>🟢 Wave Oscillator Monitor ({vfdData.vfd_id})</h3>
          <div style={{ position: "relative", width: "300px", height: "300px", margin: "20px 0" }}>
            <canvas ref={canvasRef} width={300} height={300} style={{ display: "block" }} />
            {/* จุดพิกัดศูนย์กลางเรืองแสง */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "6px", height: "6px", backgroundColor: "#38bdf8", borderRadius: "50%", boxShadow: "0 0 10px #38bdf8" }}></div>
          </div>
          <span style={{ fontSize: "12px", color: "#475569", fontFamily: "monospace" }}>VECTOR SCOPE MODE // FREQ SENSITIVE</span>
        </div>

        {/* แผงตัวเลขพารามิเตอร์ด้านขวา */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          
          <div style={{ background: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #1e293b" }}>
            <span style={{ color: "#64748b", fontSize: "13px" }}>Frequency</span>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#38bdf8", margin: "10px 0" }}>{vfdData.frequency} <span style={{ fontSize: "16px" }}>Hz</span></div>
          </div>

          <div style={{ background: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #1e293b" }}>
            <span style={{ color: "#64748b", fontSize: "13px" }}>Voltage</span>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#eab308", margin: "10px 0" }}>{vfdData.voltage} <span style={{ fontSize: "16px" }}>V</span></div>
          </div>

          <div style={{ background: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #1e293b" }}>
            <span style={{ color: "#64748b", fontSize: "13px" }}>Current Load</span>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#34d399", margin: "10px 0" }}>{vfdData.current} <span style={{ fontSize: "16px" }}>A</span></div>
          </div>

          <div style={{ background: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #1e293b" }}>
            <span style={{ color: "#64748b", fontSize: "13px" }}>Inverter Temp</span>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#a855f7", margin: "10px 0" }}>{vfdData.temperature} <span style={{ fontSize: "16px" }}>°C</span></div>
          </div>

          {/* แผงสวิตช์สถานะขนาดใหญ่ด้านล่าง */}
          <div style={{ gridColumn: "span 2", background: "#0f172a", padding: "25px", borderRadius: "12px", border: "1px solid #1e293b", textAlign: "center" }}>
            <span style={{ color: "#64748b", fontSize: "14px", display: "block", marginBottom: "10px" }}>SYSTEM COMMAND STATUS</span>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#fb923c", marginBottom: "20px" }}>⚡ GRID STATUS: {vfdData.status}</div>
            <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
              <button style={{ background: "#16a34a", color: "white", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", transition: "0.2s" }}>SYSTEM RUN</button>
              <button style={{ background: "#dc2626", color: "white", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", transition: "0.2s" }}>SYSTEM STOP</button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
