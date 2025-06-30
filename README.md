# 📱 DakLakCoffeeSupplyChain_Mobile (Farmer App)

**Mobile App for Farmers in the Dak Lak Coffee Supply Chain Management System**

📅 **Duration:** May 2025 – August 2025  
🎓 **Capstone Project** – FPT University | Software Engineering

---

## 👥 Team Members

| Name                      | ID        | Role         |
|---------------------------|-----------|--------------|
| Lê Hoàng Phúc             | SE173083  | Project Lead |
| Nguyễn Nhật Minh          | SE161013  |              |
| Lê Hoàng Thiên Vũ         | SE160593  |              |
| Phạm Huỳnh Xuân Đăng      | SE161782  |              |
| Phạm Trường Nam           | SE150442  |              |

---

## ⚙️ Tech Stack

| Layer       | Technology                             |
|-------------|-----------------------------------------|
| Framework   | **React Native (Expo)**                 |
| Language    | TypeScript                              |
| Navigation  | React Navigation v6                     |
| Styling     | Tailwind CSS (via Nativewind)           |
| Auth        | JWT (stored in `AsyncStorage`)          |
| State Mgmt  | React Hooks, Context API                |
| API Access  | RESTful (via Axios)                     |
| Dev Tools   | Expo Go, JSON Server (optional mock)    |

---

## 🌾 App Purpose

Ứng dụng này được thiết kế **dành riêng cho người nông dân** trong chuỗi cung ứng cà phê tại Đắk Lắk, giúp họ:

- Đăng ký mùa vụ
- Theo dõi tiến độ trồng và chăm sóc cây
- Gửi cập nhật sản lượng
- Nhận phản hồi từ chuyên gia

---

## 🧩 Main Features for Farmers

| Chức năng                     | Mô tả                                                                 |
|-------------------------------|----------------------------------------------------------------------|
| 🌱 Quản lý mùa vụ             | Xem danh sách mùa vụ đã đăng ký, chi tiết từng mùa vụ               |
| 🧾 Gửi cập nhật tiến độ       | Cập nhật hoạt động canh tác theo từng giai đoạn                     |
| 📦 Gửi sản lượng thu hoạch    | Gửi thông tin sản lượng cho hợp tác xã/doanh nghiệp                 |
| 🧠 Yêu cầu phản hồi chuyên gia| Gửi câu hỏi, hình ảnh đến chuyên gia nông nghiệp                    |
| 👤 Trang cá nhân              | Xem & chỉnh sửa thông tin người dùng                                |

---

## 🗂 Project Structure

```bash
📦 DakLakCoffee_Mobile

app/
├── navigation/              # Stack navigation cho Farmer
├── screens/
│   ├── auth/                # Login, Register
│   ├── farmer/
│   │   ├── cropSeasons/     # Mùa vụ
│   │   ├── progressLogs/    # Nhật ký tiến độ
│   │   ├── harvestReports/  # Gửi sản lượng
│   │   └── feedback/        # Yêu cầu phản hồi
│   └── profile/             # Trang cá nhân

├── components/              # UI components (Card, Modal, etc.)
├── services/                # Axios API services
├── contexts/                # Auth context
├── utils/                   # formatDate, slugify, etc.
├── constants/               # API endpoints, enums
├── assets/                  # Ảnh logo, minh họa

.env                         # Env file (API_URL, ...)
app.json                     # Expo config
tailwind.config.js           # Tailwind (nativewind)

🛠 Getting Started (Development)
# 1. Cài đặt dependency
npm install

# 2. Khởi chạy Expo dev server
npx expo start

# 3. Cấu hình .env.local
NEXT_PUBLIC_API_URL=http://<your-backend-url>:8080

