# Computer Programming for Mathematics 1 — 040223101

หนังสือเรียนออนไลน์ธีมอนิเมะ สำหรับวิชา **Computer Programming for Mathematics 1 (040223101)**
ภาควิชาคณิตศาสตร์ คณะวิทยาศาสตร์ประยุกต์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ (KMUTNB)

🌐 **เว็บไซต์:** https://januchit.github.io/compro-math1/

ผู้สอน: รศ. ดร. อนุชิต จิตพัฒนกุล · ภาคเรียนที่ 1 ปีการศึกษา 2569

## เนื้อหา

นักศึกษาสามารถเปิดอ่านสไลด์ของแต่ละบทแบบ **พลิกหน้าได้เหมือนหนังสือจริง** บนเบราว์เซอร์ ไม่ต้องดาวน์โหลด

| บท | หัวข้อ | หน้า |
|----|--------|------|
| 1 | Introduction to Computers and Python | 40 |
| 2 | Variables, Input and Output | 40 |
| 3 | Using Standard Libraries | 40 |

## คุณสมบัติ

- 📖 อ่านแบบเปิดหนังสือสองหน้า (เดสก์ท็อป) / ทีละหน้า (มือถือ)
- ⌨️ เปลี่ยนหน้าด้วยปุ่ม ลูกศรคีย์บอร์ด คลิกขอบหน้า หรือปัดนิ้ว
- 🔍 ซูมเข้า–ออก และดูแบบเต็มจอ
- ⬇️ ดาวน์โหลด PDF ไปอ่านออฟไลน์
- 📱 ใช้งานได้ทั้งคอมพิวเตอร์ แท็บเล็ต และมือถือ

## โครงสร้างโปรเจกต์

```
compro-math1/
├── index.html              # หน้าแรก (ชั้นหนังสือ)
├── reader.html             # หน้าอ่านหนังสือแบบ flipbook
├── books/                  # ไฟล์ PDF แต่ละบท
├── assets/
│   ├── css/                # style.css, reader.css
│   ├── js/reader.js        # โปรแกรมอ่านหนังสือ (PDF.js)
│   └── img/covers/         # ภาพปกของแต่ละบท
└── .nojekyll
```

## เทคโนโลยี

- HTML / CSS / JavaScript (ไม่มี build step)
- [PDF.js](https://mozilla.github.io/pdf.js/) สำหรับเรนเดอร์ PDF ในเบราว์เซอร์
- โฮสต์ด้วย GitHub Pages

## การพัฒนาในเครื่อง

ต้องเสิร์ฟผ่าน HTTP (เพราะ `reader.js` เป็น ES module และโหลด PDF)

```bash
python3 -m http.server 8000
# เปิด http://localhost:8000
```

---

© 2569 (2026) Department of Mathematics, Faculty of Applied Science, KMUTNB
