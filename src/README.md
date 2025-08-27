# Cấu trúc Module của Dự án

Dự án đã được tổ chức lại theo cấu trúc module để dễ dàng bảo trì và mở rộng.

## Cấu trúc Thư mục

```
src/
├── app/                    # Lớp ứng dụng chính
│   ├── context/           # React contexts (AuthContext, etc.)
│   ├── routes/            # Route guards và routing logic
│   ├── pages/             # Pages components (NotFound, etc.)
│   ├── App.tsx           # Component ứng dụng chính
│   └── main.tsx          # Entry point
├── modules/              # Các module chức năng
│   ├── auth/             # Module xác thực
│   │   ├── components/   # Auth components (LoginPage, etc.)
│   │   ├── services/     # Auth services
│   │   ├── types/        # Auth type definitions
│   │   └── index.ts      # Barrel exports
│   ├── chat/             # Module chat
│   │   ├── components/   # Chat components
│   │   ├── services/     # Chat services
│   │   ├── types/        # Chat type definitions
│   │   └── index.ts      # Barrel exports
│   ├── friends/          # Module bạn bè
│   │   ├── components/   # Friends components
│   │   ├── services/     # Friends services
│   │   ├── types/        # Friends type definitions
│   │   └── index.ts      # Barrel exports
│   ├── profile/          # Module hồ sơ người dùng
│   │   ├── components/   # Profile components
│   │   ├── services/     # Profile services
│   │   ├── types/        # Profile type definitions
│   │   └── index.ts      # Barrel exports
│   └── shared/           # Module chia sẻ
│       ├── api/          # HTTP client và API endpoints
│       ├── components/   # UI components (Button, Input, etc.)
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utility functions
│       ├── services/     # Shared services
│       ├── types/        # Shared type definitions
│       └── index.ts      # Barrel exports
├── assets/               # Static assets
├── styles/               # CSS/styling files
│   ├── index.css         # Global styles
│   └── App.css           # App-specific styles
└── vite-env.d.ts        # Vite type definitions

```

## Nguyên tắc Tổ chức

### 1. Module-based Architecture
- Mỗi module tập trung vào một domain/chức năng cụ thể
- Module có thể chứa: components, services, types, hooks riêng
- Sử dụng barrel exports (index.ts) để export public API

### 2. Separation of Concerns
- **app/**: Logic ứng dụng cấp cao (routing, context, main app)
- **modules/**: Business logic theo từng domain
- **shared/**: Code dùng chung giữa các module
- **styles/**: Styling tách biệt
- **assets/**: Static files

### 3. Import Patterns
```typescript
// Import từ module khác
import { LoginPage } from '../modules/auth';
import { ChatLayout } from '../modules/chat';
import { Button, Input } from '../modules/shared';

// Import trong cùng module
import { AuthService } from './services/auth.service';
import { useAuth } from '../../app/context/AuthContext';
```

## Path Aliases

Đã cấu hình các alias trong `vite.config.ts` và `tsconfig.app.json`:

```typescript
{
  "@/*": ["./src/*"],
  "@modules/*": ["./src/modules/*"],
  "@app/*": ["./src/app/*"],
  "@shared/*": ["./src/modules/shared/*"],
  "@styles/*": ["./src/styles/*"]
}
```

## Lợi ích

1. **Maintainability**: Code được tổ chức theo domain, dễ tìm và sửa
2. **Scalability**: Dễ thêm module mới mà không ảnh hưởng module khác
3. **Reusability**: Shared module chứa code tái sử dụng
4. **Team Collaboration**: Các team có thể làm việc độc lập trên từng module
5. **Testing**: Dễ test từng module riêng biệt

## Quy tắc Phát triển

1. **Module Independence**: Module không nên import trực tiếp từ module khác (trừ shared)
2. **Barrel Exports**: Luôn sử dụng index.ts để export public API
3. **Shared First**: Đưa code dùng chung vào shared module
4. **Single Responsibility**: Mỗi module chỉ chịu trách nhiệm cho một domain