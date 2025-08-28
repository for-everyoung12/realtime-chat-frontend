# Hướng dẫn sử dụng Alias Import (@)

## Cấu hình đã thiết lập

Dự án đã được cấu hình sẵn các alias import trong:

### 1. TypeScript Config (`tsconfig.app.json`)
```json
{
  "baseUrl": ".",
  "paths": {
    "@/*": ["./src/*"],
    "@modules/*": ["./src/modules/*"],
    "@app/*": ["./src/app/*"],
    "@shared/*": ["./src/modules/shared/*"],
    "@styles/*": ["./src/styles/*"]
  }
}
```

### 2. Vite Config (`vite.config.ts`)
```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
    "@modules": path.resolve(__dirname, "./src/modules"),
    "@app": path.resolve(__dirname, "./src/app"),
    "@shared": path.resolve(__dirname, "./src/modules/shared"),
    "@styles": path.resolve(__dirname, "./src/styles"),
  },
}
```

## Cách sử dụng

### Alias có sẵn:

1. **`@/*`** - Trỏ đến thư mục `src/`
   ```typescript
   import { Button } from "@/components/ui/button";
   ```

2. **`@modules/*`** - Trỏ đến thư mục `src/modules/`
   ```typescript
   import { ChatService } from "@modules/chat/services/chat.service";
   ```

3. **`@app/*`** - Trỏ đến thư mục `src/app/`
   ```typescript
   import { AuthContext } from "@app/context/AuthContext";
   ```

4. **`@shared/*`** - Trỏ đến thư mục `src/modules/shared/`
   ```typescript
   import { Button } from "@shared/components/button";
   import { API } from "@shared/api/endpoints";
   ```

5. **`@styles/*`** - Trỏ đến thư mục `src/styles/`
   ```typescript
   import "@styles/index.css";
   ```

## Ví dụ sử dụng

```typescript
// Import components từ shared
import { Button } from "@shared/components/button";
import { Input } from "@shared/components/input";

// Import services từ modules
import { ChatService } from "@modules/chat/services/chat.service";
import { AuthService } from "@modules/auth/services/auth.service";

// Import API endpoints
import { API } from "@shared/api/endpoints";

// Import styles
import "@styles/App.css";
```

## Lưu ý

- Đảm bảo restart TypeScript server sau khi thay đổi cấu hình
- Sử dụng alias giúp code dễ đọc và maintain hơn
- Tránh sử dụng relative path dài như `../../../components/Button`

