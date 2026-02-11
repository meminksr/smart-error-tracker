# ⚡ Smart Error Tracker

Frontend ve Backend hatalarını toplayan, gruplayan ve **AI destekli kök neden analizi** yapan akıllı hata takip sistemi.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 Özellikler

- **Hata Toplama** — Frontend (client-side) ve Backend (server-side) hatalarını tek panelde görüntüleme
- **Severity Seviyeleri** — Kritik, Yüksek, Orta ve Düşük olarak hata sınıflandırma
- **Akıllı Filtreleme** — Tip, severity ve metin araması ile hataları filtreleme
- **AI Kök Neden Analizi** — Her hata için olası nedenleri, çözüm önerilerini ve güven skorunu gösteren yapay zeka paneli
- **Stack Trace Görüntüleme** — Hata kaynak kodunu ve çağrı yığınını detaylı inceleme
- **İlişkili Hata Tespiti** — Birbiriyle bağlantılı hataları otomatik gruplama
- **Canlı İzleme** — Gerçek zamanlı hata akışı göstergeleri
- **Responsive Tasarım** — Koyu tema, modern UI

## 📸 Ekran Görüntüsü

> Projeyi çalıştırdıktan sonra ekran görüntüsü ekleyebilirsiniz:
> `![Screenshot](./screenshot.png)`

## 🚀 Kurulum

### Gereksinimler

- [Node.js](https://nodejs.org/) (v18 veya üzeri)
- npm veya yarn

### Adımlar

```bash
# Repoyu klonlayın
git clone https://github.com/KULLANICI_ADINIZ/smart-error-tracker.git
cd smart-error-tracker

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda `http://localhost:5173` adresini açın.

### Production Build

```bash
npm run build
npm run preview
```

## 🏗️ Proje Yapısı

```
smart-error-tracker/
├── public/
├── src/
│   ├── App.jsx          # Ana uygulama bileşeni (tüm logic burada)
│   ├── App.css           
│   ├── index.css         
│   └── main.jsx          # React giriş noktası
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🧠 AI Analiz Sistemi

Bir hataya tıkladığınızda AI paneli şu bilgileri sunar:

| Alan | Açıklama |
|------|----------|
| **Kategori** | Hata türü sınıflandırması (ör: Database Connection Failure) |
| **Güven Skoru** | Analizin doğruluk yüzdesi |
| **Kök Neden** | Hatanın neden oluştuğuna dair detaylı açıklama |
| **Çözüm Önerileri** | Adım adım düzeltme tavsiyeleri |
| **Stack Trace** | Hata çağrı yığını |
| **İlişkili Hatalar** | Bağlantılı diğer hatalar |

## 🛠️ Teknolojiler

- **React 19** — UI bileşenleri
- **Vite** — Hızlı geliştirme ve build
- **CSS-in-JS** — Inline stil sistemi
- **Google Fonts** — Space Grotesk & JetBrains Mono

## 📋 Örnek Hata Türleri

Sistem şu anda aşağıdaki örnek hataları içermektedir:

**Frontend:**
- TypeError (undefined property access)
- RangeError (stack overflow)
- ResizeObserver hataları
- Webpack chunk yükleme hataları

**Backend:**
- PostgreSQL bağlantı hataları
- JWT authentication hataları
- Bellek yetersizliği hataları
- Unique constraint ihlalleri

## 🔮 Geliştirme Fikirleri

- [ ] Gerçek hata yakalama SDK'sı (window.onerror, unhandledrejection)
- [ ] Claude API entegrasyonu ile dinamik AI analizi
- [ ] WebSocket ile gerçek zamanlı hata akışı
- [ ] Hata istatistikleri ve trend grafikleri
- [ ] E-posta / Slack bildirim entegrasyonu
- [ ] Kullanıcı oturum bilgisi ile hata eşleştirme
- [ ] Hata çözümleme ve durum takibi (açık/çözüldü/yoksayıldı)

## 📄 Lisans

MIT License — Dilediğiniz gibi kullanabilirsiniz.

---

<p align="center">
  <b>⚡ Smart Error Tracker</b> ile hatalarınızı akıllıca takip edin.
</p>