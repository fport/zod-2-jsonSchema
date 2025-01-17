# Zod to JSON Schema Converter

Bu araç, [Zod](https://github.com/colinhacks/zod) şema tanımlarını [JSON Schema](https://json-schema.org/) formatına dönüştürmenizi sağlar. Next.js ve TypeScript kullanılarak geliştirilmiş web tabanlı bir dönüştürücüdür.

## Özellikler

- ✨ Canlı önizleme ile anında dönüşüm
- 🎨 Monaco Editor entegrasyonu ile syntax highlighting
- 🔄 Karmaşık Zod şemalarını destekler
- 🛡️ TypeScript ile tam tip desteği

## Desteklenen Zod Tipleri

- `z.string()` - String validasyonları (email, url vb.)
- `z.number()` - Sayısal validasyonlar (min, max)
- `z.date()` - Tarih alanları
- `z.enum()` - Enum değerleri
- `z.object()` - Nested objeler
- `z.array()` - Array tipleri
- `optional()` - Opsiyonel alanlar
- `default()` - Varsayılan değerler

## Kurulum

```bash
# Projeyi klonlayın
git clone https://github.com/your-username/zod-to-json-schema.git

# Dizine gidin
cd zod-to-json-schema

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

## Kullanım Örneği

```typescript
// Örnek Zod şeması
z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  preferences: z.object({
    theme: z.enum(["light", "dark", "system"]).default("system"),
    language: z.enum(["en", "tr"]).default("en"),
  }).optional(),
})
```

Bu şema aşağıdaki JSON Schema'ya dönüştürülür:

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "email": { "type": "string", "format": "email" },
    "displayName": { "type": "string" },
    "photoURL": { "type": "string", "format": "uri" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" },
    "preferences": {
      "type": "object",
      "properties": {
        "theme": {
          "type": "string",
          "enum": ["light", "dark", "system"],
          "default": "system"
        },
        "language": {
          "type": "string",
          "enum": ["en", "tr"],
          "default": "en"
        }
      }
    }
  },
  "required": ["id", "email", "createdAt", "updatedAt"]
}
```

## Geliştirme

1. Projeyi forklayın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Teknolojiler

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Zod](https://github.com/colinhacks/zod)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Tailwind CSS](https://tailwindcss.com/)

## Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.
