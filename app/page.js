"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [selectedVfd, setSelectedVfd] = useState("TVE-VFD-00001");
  
  const [vfdData, setVfdData] = useState({
    vfd_id: "Loading...",
    frequency: 0,
    current: 0,
    max_current: 0,
    voltage: 0,
    temperature: 0,
    status: "Initializing"
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:1880/api/vfd-data?id=${selectedVfd}`, {
          mode: "cors"
        });
        const data = await response.json();
        if (isMounted) setVfdData(data);
      } catch (error) {
        if (isMounted) {
          let baseFreq = 45;
          let baseAmp = 12.5;
          let maxAmp = 20.0;
          let baseVolt = 380.0;
          let baseTemp = 38.5;
          let machineStatus = "Running";

          if (selectedVfd === "TVE-VFD-00002") {
            baseFreq = 38.2;
            baseAmp = 8.4;
            maxAmp = 15.0;
            baseVolt = 378.5;
            baseTemp = 42.1;
            machineStatus = "Running (Eco)";
          } else if (selectedVfd === "TVE-VFD-00003") {
            baseFreq = 49.8;
            baseAmp = 18.2;
            maxAmp = 30.0;
            baseVolt = 382.1;
            baseTemp = 48.7;
            machineStatus = "High Load";
          }

          const mockFreq = (baseFreq + Math.random() * 1.5).toFixed(1);
          const mockAmp = (baseAmp + Math.random() * 0.8).toFixed(1);
          const mockVolt = (baseVolt + (Math.random() * 4 - 2)).toFixed(1);
          const mockTemp = (baseTemp + Math.random() * 0.5).toFixed(1);

          setVfdData({
            vfd_id: selectedVfd,
            frequency: parseFloat(mockFreq),
            current: parseFloat(mockAmp),
            max_current: maxAmp, 
            voltage: parseFloat(mockVolt),
            temperature: parseFloat(mockTemp),
            status: machineStatus
          });
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedVfd]);

  return (
    <div style={{ padding: "40px", fontFamily: "'Segoe UI', Roboto, sans-serif", backgroundColor: "#0f172a", color: "#f8fafc", minHeight: "100vh" }}>
      
      {/* 🛠️ เปลี่ยนเป็น Ion Storage Power ตรงนี้เรียบร้อยครับ */}
      <div style={{ borderBottom: "1px solid #334155", paddingBottom: "20px", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", color: "#38bdf8", margin: 0 }}>🎛️ Ion Storage Power & VFD Global Fleet Management</h1>
        <p style={{ color: "#94a3b8", margin: "5px 0 0 0" }}>ระบบบริหารจัดการและตั้งค่าออนไลน์ รองรับการขยายตัว 100,000 เครื่อง</p>
      </div>

      {/* ช่อง Dropdown สำหรับเลือก VFD */}
      <div style={{ marginBottom: "25px", display: "flex", alignItems: "center", gap: "12px" }}>
        <label style={{ color: "#94a3b8", fontSize: "15px" }}>เลือกเครื่องจักรที่ต้องการควบคุม:</label>
        <select 
          value={selectedVfd} 
          onChange={(e) => setSelectedVfd(e.target.value)}
          style={{ backgroundColor: "#1e293b", color: "#38bdf8", border: "1px solid #475569", padding: "8px 16px", borderRadius: "8px", fontSize: "15px", fontWeight: "bold", cursor: "pointer", outline: "none" }}
        >
          <option value="TVE-VFD-00001">🏭 VFD Machine 01 (ชุดเทสที่ 1)</option>
          <option value="TVE-VFD-00002">🏭 VFD Machine 02 (ชุดเทสที่ 2)</option>
          <option value="TVE-VFD-00003">🏭 VFD Machine 03 (ชุดเทสที่ 3)</option>
        </select>
      </div>

      {/* บล็อกแสดงสถานะเครื่องที่เลือก */}
      <div style={{ marginBottom: "20px" }}>
        <span style={{ backgroundColor: "#1e293b", padding: "8px 16px", borderRadius: "20px", fontSize: "14px", border: "1px solid #475569" }}>
          📡 กำลังมอนิเตอร์พารามิเตอร์รหัส: <strong style={{ color: "#38bdf8" }}>{vfdData.vfd_id}</strong>
        </span>
      </div>

      {/* Grid บล็อกเกจวัดทั้งหมด 5 ช่อง */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        
        {/* การ์ดความถี่ */}
        <div style={{ background: "#1e293b", padding: "25px", borderRadius: "12px", border: "1px solid #334155", textAlign: "center" }}>
          <h3 style={{ color: "#94a3b8", marginTop: 0, fontSize: "15px" }}>ความถี่เอาต์พุต (Frequency)</h3>
          <div style={{ fontSize: "40px", fontWeight: "bold", color: "#38bdf8", margin: "15px 0" }}>
            {vfdData.frequency} <span style={{ fontSize: "18px", color: "#64748b" }}>Hz</span>
          </div>
          <div style={{ width: "100%", height: "8px", backgroundColor: "#334155", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: `${(vfdData.frequency / 50) * 100}%`, height: "100%", backgroundColor: "#38bdf8", transition: "width 0.5s ease" }}></div>
          </div>
        </div>

        {/* การ์ดแรงดันไฟฟ้า 380V */}
        <div style={{ background: "#1e293b", padding: "25px", borderRadius: "12px", border: "1px solid #334155", textAlign: "center" }}>
          <h3 style={{ color: "#94a3b8", marginTop: 0, fontSize: "15px" }}>แรงดันไฟฟ้า (Voltage)</h3>
          <div style={{ fontSize: "40px", fontWeight: "bold", color: "#eab308", margin: "15px 0" }}>
            {vfdData.voltage} <span style={{ fontSize: "18px", color: "#64748b" }}>V</span>
          </div>
          <div style={{ width: "100%", height: "8px", backgroundColor: "#334155", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: `${(vfdData.voltage / 440) * 100}%`, height: "100%", backgroundColor: "#eab308", transition: "width 0.5s ease" }}></div>
          </div>
        </div>

        {/* การ์ดกระแสไฟฟ้า */}
        <div style={{ background: "#1e293b", padding: "25px", borderRadius: "12px", border: "1px solid #334155", textAlign: "center" }}>
          <h3 style={{ color: "#94a3b8", marginTop: 0, fontSize: "15px" }}>กระแสไฟฟ้าทำงาน (Current)</h3>
          <div style={{ fontSize: "40px", fontWeight: "bold", color: "#34d399", margin: "15px 0" }}>
            {vfdData.current} <span style={{ fontSize: "18px", color: "#64748b" }}>A</span>
          </div>
          <div style={{ width: "100%", height: "8px", backgroundColor: "#334155", borderRadius: "4px", overflow: "hidden", marginBottom: "10px" }}>
            <div style={{ width: `${(vfdData.current / vfdData.max_current) * 100}%`, height: "100%", backgroundColor: "#34d399", transition: "width 0.5s ease" }}></div>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>พิกัดกระแสสูงสุด: {vfdData.max_current} A</span>
        </div>

        {/* การ์ดอุณหภูมิระบบ VFD */}
        <div style={{ background: "#1e293b", padding: "25px", borderRadius: "12px", border: "1px solid #334155", textAlign: "center" }}>
          <h3 style={{ color: "#94a3b8", marginTop: 0, fontSize: "15px" }}>อุณหภูมิอินเวอร์เตอร์ (Temp)</h3>
          <div style={{ fontSize: "40px", fontWeight: "bold", color: "#a855f7", margin: "15px 0" }}>
            {vfdData.temperature} <span style={{ fontSize: "18px", color: "#64748b" }}>°C</span>
          </div>
          <div style={{ width: "100%", height: "8px", backgroundColor: "#334155", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: `${(vfdData.temperature / 100) * 100}%`, height: "100%", backgroundColor: "#a855f7", transition: "width 0.5s ease" }}></div>
          </div>
        </div>

        {/* การ์ดสถานะและการควบคุม */}
        <div style={{ background: "#1e293b", padding: "25px", borderRadius: "12px", border: "1px solid #334155", textAlign: "center" }}>
          <h3 style={{ color: "#94a3b8", marginTop: 0, fontSize: "15px" }}>สถานะระบบ (Status)</h3>
          <div style={{ fontSize: "22px", fontWeight: "bold", color: "#fb923c", margin: "25px 0" }}>
            🟢 {vfdData.status}
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button style={{ background: "#22c55e", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>RUN</button>
            <button style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>STOP</button>
          </div>
        </div>

      </div>

    </div>
  );
}
