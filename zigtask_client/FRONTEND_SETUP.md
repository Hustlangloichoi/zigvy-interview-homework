# Frontend Setup - Kết nối với Backend

## Các thay đổi đã thực hiện

### 1. Cấu hình API (src/lib/api.ts)

- Tạo configuration cho API endpoints
- Hàm helper để tạo auth headers
- Error handling và response processing

### 2. Cập nhật Auth Store (src/lib/stores/auth-store.ts)

- Thay thế mock functions bằng API calls thực tế
- Xử lý JWT tokens
- Error handling và loading states
- Persistent storage cho user và token

### 3. Cập nhật Task Store (src/lib/stores/task-store.ts)

- Kết nối với backend API cho CRUD operations
- Authentication headers cho mọi request
- Optimistic updates cho UI responsiveness
- Error handling và rollback

### 4. Authentication Hooks

- `useAuthRedirect`: Bảo vệ protected routes
- `useGuestRedirect`: Redirect authenticated users khỏi login/signup
- `useAuthSync`: Tự động fetch data khi user login

### 5. Environment Configuration

- `.env.local`: Cấu hình API URL
- `next.config.js`: Proxy setup cho development

## Cách chạy

### 1. Cài đặt dependencies

```bash
cd zigtask_client
npm install
```

### 2. Tạo file .env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NODE_ENV=development
```

### 3. Chạy backend trước

```bash
cd zigtask_api
npm run start:dev
```

### 4. Chạy frontend

```bash
cd zigtask_client
npm run dev
```

## API Endpoints được sử dụng

### Auth

- `POST /api/auth/login` - Login user
- `POST /api/auth/signup` - Register user
- `POST /api/auth/logout` - Logout user

### Tasks

- `GET /api/tasks` - Lấy danh sách tasks
- `POST /api/tasks` - Tạo task mới
- `PUT /api/tasks/:id` - Cập nhật task
- `DELETE /api/tasks/:id` - Xóa task

## Lưu ý

1. **CORS**: Backend cần enable CORS cho frontend URL
2. **JWT**: Frontend sẽ gửi JWT token trong Authorization header
3. **Error Handling**: Tất cả errors sẽ được hiển thị trong UI
4. **Auto-sync**: Khi user login, tasks sẽ được tự động fetch
5. **Optimistic Updates**: UI sẽ update ngay lập tức, rollback nếu có lỗi

## Troubleshooting

1. **CORS Issues**: Kiểm tra backend có enable CORS chưa
2. **Connection Refused**: Đảm bảo backend đang chạy ở port 3001
3. **Auth Errors**: Kiểm tra JWT secret và token format
4. **Data Not Loading**: Kiểm tra API endpoints và authentication headers
