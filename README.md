# 📱 DakLakCoffeeSupplyChain\_Mobile

**Mobile App dành cho Nông Dân trong Hệ thống Quản Lý Chuỗi Cung Ứng Cà Phê Đắk Lắk**
🗕️ **Thời gian thực hiện:** Tháng 5 – Tháng 8, 2025
🎓 **Đồ án Tốt nghiệp** – Đại học FPT | Ngành Kỹ thuật Phần mềm

---

## 👥 Thành viên nhóm

* Lê Hoàng Phúc – SE173083 *(Project Lead)*
* Nguyễn Nhật Minh – SE161013
* Lê Hoàng Thiên Vũ – SE160593
* Phạm Huỳnh Xuân Đăng – SE161782
* Phạm Trường Nam – SE150442

---

## ⚙️ Tech Stack

| Layer         | Technology                            |
| ------------- | ------------------------------------- |
| Framework     | React Native (Expo CLI)               |
| Language      | JavaScript                            |
| UI            | NativeWind / React Native Paper       |
| State Mgmt    | Zustand / Redux Toolkit               |
| Navigation    | @react-navigation/native              |
| API Handling  | Axios / Fetch                         |
| Auth          | JWT (from backend)                    |
| Image Upload  | `expo-image-picker`                   |
| QR Scanner    | `expo-camera`, `expo-barcode-scanner` |
| Notifications | `expo-notifications` *(optional)*     |

---

## 👨‍🌾 Đối tượng sử dụng: Farmer

Ứng dụng di động hỗ trợ nông dân quản lý toàn bộ quá trình trồng trọt và cập nhật mùa vụ:

### 📲 Các chức năng chính

| Màn hình                       | Mô tả                                                         |
| ------------------------------ | ------------------------------------------------------------- |
| **Đăng nhập / Đăng ký**        | Sử dụng tài khoản đã được cấp bởi doanh nghiệp                |
| **Trang chủ**                  | Xem nhanh mùa vụ đang tham gia, trạng thái mùa vụ, tiến trình |
| **Danh sách kế hoạch thu mua** | Xem danh sách kế hoạch từ doanh nghiệp, đăng ký tham gia      |
| **Quản lý mùa vụ đã đăng ký**  | Xem & cập nhật chi tiết từng dòng sản xuất đã đăng ký         |
| **Tiến trình mùa vụ**          | Cập nhật các giai đoạn trồng – tưới – chăm sóc – thu hoạch    |
| **Báo cáo bất thường**         | Gửi báo cáo sâu bệnh, mất mùa... kèm hình ảnh, mô tả          |
| **Tư vấn từ chuyên gia**       | Nhận lời khuyên, nội dung tư vấn từ chuyên gia hoặc AI        |
| **Sơ chế sau thu hoạch**       | Gửi thông tin lô cà phê thu hoạch để xử lý                    |
| **Thông báo hệ thống**         | Nhận thông báo từ doanh nghiệp / chuyên gia                   |
| **Hồ sơ cá nhân**              | Cập nhật thông tin cá nhân, vị trí nông trại, diện tích       |

> 🤩 *Tất cả dữ liệu đồng bộ qua RESTful API với hệ thống backend ASP.NET Core.*

---

## 🔐 Xác thực & Bảo mật

* JWT Token-based Authentication
* Role: `Farmer` được kiểm soát quyền truy cập rõ ràng
* Mã hóa dữ liệu truyền tải qua HTTPS

---

## 🚀 Hướng dẫn chạy ứng dụng (Local)

```bash
# Cài đặt dependencies
npm install

# Chạy ứng dụng trên Expo
npx expo start
```

> 📦 *Ứng dụng được tối ưu chạy trên cả Android & iOS*

---

## 🔗 Liên kết liên quan

* **[Backend Repo](https://github.com/your-team/DakLakCoffeeSupplyChain_BE)**

---

*Nếu bạn muốn mình tạo thêm mockup Figma, assets UI, hoặc chia nhỏ thư mục code React Native thì có thể yêu cầu tiếp nhé!*
