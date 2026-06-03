"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [vfdData, setVfdData] = useState({
    vfd_id: "VFD-100K-PREVIEW",
    frequency: 0,
    current: 0,
    status: "Offline"
  });

  // ฟังก์ชันวิ่งไปเคาะประตูเอา Data จาก Node-RED 後臺 (หรือจำลองข้อมูลสดเพื่อทดสอบหน้าเว็บ)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // เมื่อต้องการต่อจริง: เปลี่ยน URL เป็น IP/Domain หลังบ้านของคุณ
        const response = await fetch("http://localhost:1880/api/vfd-data");
        const data = await response.json();
        setVfdData(data);
      } catch (error) {
        // ถ้าระบบหลังบ้านยังไม่เปิด หรือยังไม่ได้ต่ออินเทอร์เน็ต จะทำการสุ่มจำลองค่าความถี่ 40Hz - 50Hz ให้เกจวัดขยับได้โชว์บน Vercel ไปก่อน
        const mockFreq = (40 + Math.random() * 10).toFixed(1);
        const mockAmp = (10 + Math.random() * 5).toFixed(1);
        setVfdData({
          vfd_id: "TVE-VFD-00001 (Mockup)",
          frequency: parseFloat(mockFreq),
          current: parseFloat(mockAmp),
          status: "Running"
        });
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000); // อัปเดตข้อมูลความถี่ทุกๆ 2 วินาที
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "'Segoe UI', Roboto, sans-serif", backgroundColor: "#0f172a", color: "#f8fafc", minHeight: "100vh" }}>
      
      {/* ส่วนหัวของเว็บควบคุมระดับแสนเครื่อง */}
      <div style={{ borderBottom: "1px solid #334155", paddingBottom: "20px", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", color: "#38bdf8", margin: 0 }}>🎛️ TVE Flywheel & VFD Global Fleet Management</h1>
        <p style={{ color: "#94a3b8", margin: "5px 0 0 0" }}>ระบบบริหารจัดการและตั้งค่าออนไลน์ รองรับการขยายตัว 100,000 เครื่อง</p>
      </div>

      {/* บล็อกแสดงสถานะเครื่องที่เลือก */}
      <div style={{ marginBottom: "20px" }}>
        <span style={{ backgroundColor: "#1e293b", padding: "8px 16px", borderRadius: "20px", fontSize: "14px", border: "1px solid #475569" }}>
          📡 กำลังตรวจสอบเครื่อง: <strong style={{ color: "#38bdf8" }}>{vfdData.vfd_id}</strong>
        </span>
      </div>

      {/* Grid การแสดงผลการวัด (Metrics Cards) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
        
        {/* การ์ดความถี่ (เกจจำลอง) */}
        <div style={{ background: "#1e293b", padding: "25px", borderRadius: "12px", border: "1px solid #334155", textAlign: "center" }}>
          <h3 style={{ color: "#94a3b8", marginTop: 0, fontSize: "16px" }}>ความถี่เอาต์พุต (Frequency)</h3>
          <div style={{ fontSize: "48px", fontWeight: "bold", color: "#38bdf8", margin: "15px 0" }}>
            {vfdData.frequency} <span style={{ fontSize: "20px", color: "#64748b" }}>Hz</span>
          </div>
          {/* แถบหลอดแก้วจำลองเกจวัดความถี่ระหว่าง 40Hz - 50Hz */}
          <div style={{ width: "100%", height: "8px", backgroundColor: "#334155", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: `${(vfdData.frequency / 50) * 100}%`, height: "100%", backgroundColor: "#38bdf8", transition: "width 0.5s ease" }}></div>
          </div>
        </div>

        {/* การ์ดกระแสไฟฟ้า */}
        <div style={{ background: "#1e293b", padding: "25px", borderRadius: "12px", border: "1px solid #334155", textAlign: "center" }}>
          <h3 style={{ color: "#94a3b8", marginTop: 0, fontSize: "16px" }}>กระแสไฟฟ้ามอเตอร์ (Current)</h3>
          <div style={{ fontSize: "48px", fontWeight: "bold", color: "#34d399", margin: "15px 0" }}>
            {vfdData.current} <span style={{ fontSize: "20px", color: "#64748b" }}>A</span>
          </div>
          <div style={{ width: "100%", height: "8px", backgroundColor: "#334155", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: `${(vfdData.current / 20) * 100}%`, height: "100%", backgroundColor: "#34d399", transition: "width 0.5s ease" }}></div>
          </div>
        </div>

        {/* การ์ดสถานะและการควบคุม */}
        <div style={{ background: "#1e293b", padding: "25px", borderRadius: "12px", border: "1px solid #334155", textAlign: "center" }}>
          <h3 style={{ color: "#94a3b8", marginTop: 0, fontSize: "16px" }}>สถานะการทำงาน (System Status)</h3>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: vfdData.status === "Running" ? "#fb923c" : "#ef4444", margin: "28px 0" }}>
            🟢 {vfdData.status}
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button style={{ background: "#22c55e", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>RUN</button>
            <button style={{ background: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>STOP</button>
          </div>
        </div>

      </div>

    </div>
  );
}
