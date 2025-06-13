# 📱 DakLakCoffeeSupplyChain_Mobile

**Ứng dụng di động dành cho Nông Dân – Hệ thống Quản Lý Chuỗi Cung Ứng Cà Phê Đắk Lắk**

🗓 **Thời gian thực hiện:** Tháng 5 – Tháng 8, 2025  
🎓 **Đồ án Tốt nghiệp** – Đại học FPT | Ngành Kỹ thuật Phần mềm

---

## 👨‍👩‍👧‍👦 Nhóm thực hiện

- **Lê Hoàng Phúc** – SE173083 *(Project Lead)*
- Nguyễn Nhật Minh – SE161013
- Lê Hoàng Thiên Vũ – SE160593
- Phạm Huỳnh Xuân Đăng – SE161782
- Phạm Trường Nam – SE150442

---

## ⚙️ Công nghệ sử dụng

| Tầng | Công nghệ |
|------|-----------|
| Framework | Expo (React Native) |
| Ngôn ngữ | TypeScript |
| UI | React Native Paper / NativeWind |
| State Management | Zustand / Redux Toolkit |
| Navigation | React Navigation |
| Gọi API | Axios |
| Xác thực | JWT từ backend ASP.NET |
| Hình ảnh | `expo-image-picker` |
| Mã QR | `expo-camera`, `expo-barcode-scanner` |
| Thông báo | `expo-notifications` *(tuỳ chọn)* |
| Quản lý cấu hình | `.env` với `react-native-dotenv` |

---

## 👨‍🌾 Đối tượng sử dụng: Nông dân (Farmer)

Ứng dụng hỗ trợ nông dân quản lý quá trình sản xuất cà phê, kết nối với doanh nghiệp và chuyên gia kỹ thuật.

### ✨ Các tính năng chính

| Tính năng | Mô tả |
|----------|-------|
| Đăng nhập / Đăng ký | Sử dụng tài khoản do doanh nghiệp cấp |
| Trang chủ | Theo dõi mùa vụ đang tham gia |
| Kế hoạch thu mua | Xem danh sách và đăng ký kế hoạch |
| Quản lý mùa vụ | Theo dõi các dòng sản xuất đã đăng ký |
| Tiến trình mùa vụ | Cập nhật giai đoạn trồng – chăm sóc – thu hoạch |
| Báo cáo bất thường | Gửi hình ảnh & mô tả sâu bệnh, thời tiết xấu... |
| Tư vấn chuyên gia | Xem lời khuyên từ chuyên gia hoặc AI |
| Quản lý sơ chế | Gửi thông tin mẻ sơ chế sau thu hoạch |
| Thông báo hệ thống | Nhận tin tức từ doanh nghiệp, chuyên gia |
| Hồ sơ nông dân | Quản lý thông tin và vị trí nông trại |

---

## 🔐 Bảo mật & phân quyền

- Xác thực bằng JWT Token
- Phân quyền theo Role (`Farmer`)
- Mọi dữ liệu truyền tải qua HTTPS

---

## 🚀 Hướng dẫn chạy ứng dụng

```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Khởi chạy ứng dụng với Expo
npx expo start

## 🧭 Cấu trúc thư mục

| Thư mục / File      | Mô tả |
|---------------------|-------|
| `src/`              | Thư mục chính chứa toàn bộ mã nguồn |
| ├── `assets/`       | Chứa ảnh, icon, font (nếu có) |
| ├── `components/`   | Các UI component tái sử dụng (Button, Card, ...) |
| ├── `constants/`    | Các hằng số như màu sắc, spacing, theme |
| ├── `hooks/`        | Các custom hooks dùng chung trong toàn app |
| ├── `navigation/`   | Cấu hình điều hướng bằng React Navigation |
| ├── `screens/`      | Các màn hình chính: Login, Home, Support... |
| ├── `services/`     | Cấu hình và gọi API bằng Axios |
| ├── `store/`        | Global state với Zustand hoặc Redux Toolkit |
| ├── `types/`        | Khai báo các interface/type dùng chung |
| ├── `utils/`        | Hàm tiện ích như format date, validate... |
| `env.d.ts`          | Khai báo kiểu biến môi trường `.env` cho TypeScript |
| `App.tsx`           | Entry point chính của ứng dụng |



