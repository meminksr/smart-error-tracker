import { useState, useEffect, useCallback } from "react";

const SAMPLE_ERRORS = [
    {
        id: 1,
        type: "frontend",
        message: "TypeError: Cannot read properties of undefined (reading 'map')",
        source: "ProductList.jsx:47",
        timestamp: Date.now() - 120000,
        count: 23,
        severity: "critical",
        stack: "at ProductList (ProductList.jsx:47)\nat renderWithHooks (react-dom.js:14985)\nat mountIndeterminateComponent (react-dom.js:17811)",
        userAgent: "Chrome 120 / macOS",
        url: "/products",
    },
    {
        id: 2,
        type: "backend",
        message: "ECONNREFUSED: connect ECONNREFUSED 127.0.0.1:5432",
        source: "db/connection.ts:23",
        timestamp: Date.now() - 300000,
        count: 87,
        severity: "critical",
        stack: "at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1141:16)\nat Pool._acquireClient (pool.js:45)",
        endpoint: "POST /api/users",
        statusCode: 500,
    },
    {
        id: 3,
        type: "frontend",
        message: "Uncaught RangeError: Maximum call stack size exceeded",
        source: "useRecursiveHook.js:12",
        timestamp: Date.now() - 600000,
        count: 5,
        severity: "high",
        stack: "at useRecursiveHook (useRecursiveHook.js:12)\nat useRecursiveHook (useRecursiveHook.js:12)\nat useRecursiveHook (useRecursiveHook.js:12)",
        userAgent: "Firefox 121 / Windows",
        url: "/dashboard",
    },
    {
        id: 4,
        type: "backend",
        message: "JsonWebTokenError: jwt malformed",
        source: "middleware/auth.ts:18",
        timestamp: Date.now() - 900000,
        count: 12,
        severity: "high",
        stack: "at Object.module.exports (verify.js:63)\nat authMiddleware (auth.ts:18)\nat Layer.handle (router/layer.js:95)",
        endpoint: "GET /api/profile",
        statusCode: 401,
    },
    {
        id: 5,
        type: "frontend",
        message: "ResizeObserver loop completed with undelivered notifications",
        source: "Layout.jsx:102",
        timestamp: Date.now() - 45000,
        count: 342,
        severity: "low",
        stack: "at ResizeObserver.<anonymous> (Layout.jsx:102)",
        userAgent: "Chrome 120 / macOS",
        url: "/settings",
    },
    {
        id: 6,
        type: "backend",
        message: "Error: ENOMEM: not enough memory, cannot allocate 1073741824 bytes",
        source: "services/imageProcessor.ts:89",
        timestamp: Date.now() - 1800000,
        count: 3,
        severity: "critical",
        stack: "at Buffer.allocUnsafe (buffer.js:304)\nat processImage (imageProcessor.ts:89)\nat uploadHandler (upload.ts:34)",
        endpoint: "POST /api/upload",
        statusCode: 500,
    },
    {
        id: 7,
        type: "frontend",
        message: "ChunkLoadError: Loading chunk 14 failed",
        source: "webpack-runtime.js:22",
        timestamp: Date.now() - 2400000,
        count: 18,
        severity: "medium",
        stack: "at HTMLScriptElement.onScriptComplete (webpack-runtime.js:22)\nat loadScript (webpack-runtime.js:55)",
        userAgent: "Safari 17 / iOS",
        url: "/checkout",
    },
    {
        id: 8,
        type: "backend",
        message: "SequelizeUniqueConstraintError: Validation error: email must be unique",
        source: "controllers/userController.ts:34",
        timestamp: Date.now() - 3600000,
        count: 45,
        severity: "medium",
        stack: "at Query.run (query.js:50)\nat createUser (userController.ts:34)\nat Layer.handle (router/layer.js:95)",
        endpoint: "POST /api/register",
        statusCode: 409,
    },
];

const AI_ANALYSES = {
    1: {
        rootCause: "API yanıtı beklenen dizi formatında değil. Backend muhtemelen null veya undefined dönüyor.",
        suggestions: [
            "API yanıtını kontrol edin — boş veya hatalı response dönüyor olabilir",
            "Optional chaining kullanın: data?.products?.map()",
            "Varsayılan değer atayın: const items = data.products || []",
            "API contract'ı için TypeScript interface tanımlayın",
        ],
        confidence: 94,
        category: "Null Reference / API Contract Mismatch",
        relatedErrors: [7],
    },
    2: {
        rootCause: "PostgreSQL veritabanı bağlantısı kurulamıyor. Servis muhtemelen çökmüş veya bağlantı havuzu tükenmiş.",
        suggestions: [
            "PostgreSQL servisinin çalıştığını doğrulayın: systemctl status postgresql",
            "Bağlantı havuzu limitlerini kontrol edin (varsayılan genellikle 10)",
            "Connection retry mekanizması ile exponential backoff ekleyin",
            "Health check endpoint'i oluşturup monitoring ekleyin",
        ],
        confidence: 97,
        category: "Database Connection Failure",
        relatedErrors: [6],
    },
    3: {
        rootCause: "Sonsuz döngüye giren bir React hook. useEffect veya useState içinde kendini sürekli çağıran bir yapı var.",
        suggestions: [
            "Hook'un dependency array'ini kontrol edin — eksik veya yanlış bağımlılık olabilir",
            "useEffect içinde state güncellemesinin tekrar render tetikleyip tetiklemediğini kontrol edin",
            "useMemo veya useCallback ile gereksiz re-render'ları önleyin",
            "React DevTools Profiler ile render döngüsünü izleyin",
        ],
        confidence: 91,
        category: "Infinite Loop / Stack Overflow",
        relatedErrors: [],
    },
    4: {
        rootCause: "JWT token formatı bozuk veya geçersiz. Kullanıcı muhtemelen manipüle edilmiş veya expire olmuş token gönderiyor.",
        suggestions: [
            "Token'ın doğru formatta (header.payload.signature) olduğunu doğrulayın",
            "LocalStorage/cookie'deki token'ı temizleyip yeniden login ettirin",
            "Token refresh mekanizmasını kontrol edin",
            "Hata mesajını kullanıcıya uygun şekilde gösterip login sayfasına yönlendirin",
        ],
        confidence: 88,
        category: "Authentication / Token Error",
        relatedErrors: [],
    },
    5: {
        rootCause: "Tarayıcının ResizeObserver API limiti aşılıyor. Genellikle zararsızdır, ancak layout thrashing'e işaret edebilir.",
        suggestions: [
            "Bu hatayı error boundary'de filtreleyebilirsiniz — genellikle kritik değildir",
            "ResizeObserver callback'ini requestAnimationFrame ile sarmalayın",
            "Debounce ekleyerek gözlem sıklığını azaltın",
            "Yüksek sayı layout performans sorununun göstergesi olabilir",
        ],
        confidence: 82,
        category: "Browser API Limitation",
        relatedErrors: [],
    },
    6: {
        rootCause: "Sunucu belleği yetersiz. Büyük dosya işleme sırasında bellek tükeniyor — muhtemelen dosya stream edilmeden buffer'a alınıyor.",
        suggestions: [
            "Dosya yükleme boyut limitini kontrol edin ve sınırlayın",
            "Stream-based processing kullanın (Buffer yerine Readable stream)",
            "Sunucu RAM'ini artırın veya bellek limitlerini ayarlayın",
            "Büyük dosyaları parçalara ayırarak işleyin (chunked upload)",
        ],
        confidence: 95,
        category: "Memory Exhaustion",
        relatedErrors: [2],
    },
    7: {
        rootCause: "Webpack code-splitting chunk'ı yüklenemiyor. Ağ sorunu, CDN problemi veya deploy sırasında eski chunk'ların silinmesi.",
        suggestions: [
            "Deploy sonrası eski chunk'ları bir süre daha sunucuda tutun",
            "Service worker cache stratejisini kontrol edin",
            "Chunk yükleme hatası durumunda sayfayı otomatik yenileyin",
            "CDN cache invalidation stratejinizi gözden geçirin",
        ],
        confidence: 90,
        category: "Asset Loading / Deployment Issue",
        relatedErrors: [1],
    },
    8: {
        rootCause: "Aynı email ile tekrar kayıt denenmiş. Frontend'de yeterli validasyon yok veya race condition mevcut.",
        suggestions: [
            "Kayıt formunda email'in zaten kullanılıp kullanılmadığını önceden kontrol edin",
            "Backend'de anlamlı hata mesajı dönün (409 Conflict)",
            "Debounce ile email availability check endpoint'i ekleyin",
            "Concurrent request'ler için idempotency key kullanın",
        ],
        confidence: 96,
        category: "Data Integrity / Duplicate Entry",
        relatedErrors: [],
    },
};

const severityConfig = {
    critical: { color: "#ff2d55", bg: "rgba(255,45,85,0.1)", label: "Kritik", icon: "⛔" },
    high: { color: "#ff9500", bg: "rgba(255,149,0,0.1)", label: "Yüksek", icon: "🔴" },
    medium: { color: "#ffcc00", bg: "rgba(255,204,0,0.1)", label: "Orta", icon: "🟡" },
    low: { color: "#34c759", bg: "rgba(52,199,89,0.1)", label: "Düşük", icon: "🟢" },
};

function timeAgo(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "az önce";
    if (mins < 60) return `${mins}dk önce`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}sa önce`;
    return `${Math.floor(hrs / 24)}g önce`;
}

function Pulse({ color }) {
    return (
        <span style={{ position: "relative", display: "inline-block", width: 8, height: 8 }}>
      <span
          style={{
              position: "absolute",
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: color,
              animation: "pulse 2s ease-in-out infinite",
          }}
      />
      <span
          style={{
              position: "absolute",
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: color,
              opacity: 0.4,
              animation: "pulseRing 2s ease-in-out infinite",
          }}
      />
    </span>
    );
}

function ConfidenceBar({ value }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
                style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: `${value}%`,
                        height: "100%",
                        borderRadius: 2,
                        background: value > 90 ? "linear-gradient(90deg, #00d4aa, #00ffcc)" : value > 80 ? "linear-gradient(90deg, #ffcc00, #ff9500)" : "linear-gradient(90deg, #ff6b6b, #ff2d55)",
                        transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                />
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "'JetBrains Mono', monospace", minWidth: 32 }}>
        %{value}
      </span>
        </div>
    );
}

function StatCard({ label, value, sub, accent }) {
    return (
        <div
            style={{
                padding: "18px 20px",
                borderRadius: 12,
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                flex: 1,
                minWidth: 140,
            }}
        >
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.35)", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                {label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: accent || "#fff", fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>
                {value}
            </div>
            {sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6, fontFamily: "'JetBrains Mono', monospace" }}>{sub}</div>}
        </div>
    );
}

export default function SmartErrorTracker() {
    const [errors] = useState(SAMPLE_ERRORS);
    const [selectedError, setSelectedError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [severityFilter, setSeverityFilter] = useState("all");
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const runAnalysis = useCallback((error) => {
        setSelectedError(error);
        setAnalyzing(true);
        setAnalysis(null);
        setTimeout(() => {
            setAnalysis(AI_ANALYSES[error.id]);
            setAnalyzing(false);
        }, 1500);
    }, []);

    const filteredErrors = errors.filter((e) => {
        const typeMatch = filter === "all" || e.type === filter;
        const sevMatch = severityFilter === "all" || e.severity === severityFilter;
        const searchMatch = !searchQuery || e.message.toLowerCase().includes(searchQuery.toLowerCase()) || e.source.toLowerCase().includes(searchQuery.toLowerCase());
        return typeMatch && sevMatch && searchMatch;
    });

    const criticalCount = errors.filter((e) => e.severity === "critical").length;
    const totalOccurrences = errors.reduce((s, e) => s + e.count, 0);
    const frontendCount = errors.filter((e) => e.type === "frontend").length;
    const backendCount = errors.filter((e) => e.type === "backend").length;

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#0a0a0c",
                color: "#e8e8ed",
                fontFamily: "'Space Grotesk', sans-serif",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');
        
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes pulseRing { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes typewriter { from { width: 0; } to { width: 100%; } }
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        
        .error-row { transition: all 0.2s ease; cursor: pointer; }
        .error-row:hover { background-color: rgba(255,255,255,0.04) !important; }
        
        .filter-btn { 
          padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);
          background: transparent; color: rgba(255,255,255,0.45); cursor: pointer;
          font-size: 12px; font-family: 'JetBrains Mono', monospace; transition: all 0.2s;
          letter-spacing: 0.5px;
        }
        .filter-btn:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); }
        .filter-btn.active { background: rgba(255,255,255,0.08); color: #fff; border-color: rgba(255,255,255,0.15); }
        
        .suggestion-item {
          padding: 10px 14px; border-radius: 8px; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05); font-size: 13px;
          color: rgba(255,255,255,0.7); line-height: 1.5;
          animation: slideIn 0.3s ease forwards; opacity: 0;
        }
        
        .tag {
          display: inline-block; padding: 3px 10px; border-radius: 6px;
          font-size: 10px; font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.5px; text-transform: uppercase; font-weight: 500;
        }
      `}</style>

            {/* Subtle grid background */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
                    backgroundSize: "60px 60px",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />

            <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #ff2d55, #ff6b35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                            ⚡
                        </div>
                        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5 }}>Smart Error Tracker</h1>
                        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                            <Pulse color="#00d4aa" />
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>CANLI İZLEME</span>
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5 }}>
                        Frontend & Backend hata toplama · AI destekli kök neden analizi
                    </p>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
                    <StatCard label="Toplam Hata" value={errors.length} sub={`${totalOccurrences} tekrar`} />
                    <StatCard label="Kritik" value={criticalCount} accent="#ff2d55" sub="acil müdahale" />
                    <StatCard label="Frontend" value={frontendCount} accent="#7b68ee" sub="client-side" />
                    <StatCard label="Backend" value={backendCount} accent="#00d4aa" sub="server-side" />
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
                    <input
                        type="text"
                        placeholder="Hata ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            padding: "7px 14px",
                            borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.08)",
                            background: "rgba(255,255,255,0.03)",
                            color: "#fff",
                            fontSize: 12,
                            fontFamily: "'JetBrains Mono', monospace",
                            outline: "none",
                            width: 200,
                        }}
                    />
                    <div style={{ width: 1, height: 20, backgroundColor: "rgba(255,255,255,0.06)", margin: "0 4px" }} />
                    {["all", "frontend", "backend"].map((f) => (
                        <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                            {f === "all" ? "Tümü" : f === "frontend" ? "🖥 Frontend" : "⚙ Backend"}
                        </button>
                    ))}
                    <div style={{ width: 1, height: 20, backgroundColor: "rgba(255,255,255,0.06)", margin: "0 4px" }} />
                    {["all", "critical", "high", "medium", "low"].map((s) => (
                        <button key={s} className={`filter-btn ${severityFilter === s ? "active" : ""}`} onClick={() => setSeverityFilter(s)}>
                            {s === "all" ? "Tüm Seviyeler" : severityConfig[s]?.icon + " " + severityConfig[s]?.label}
                        </button>
                    ))}
                </div>

                {/* Main content */}
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                    {/* Error list */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                            style={{
                                borderRadius: 14,
                                border: "1px solid rgba(255,255,255,0.06)",
                                backgroundColor: "rgba(255,255,255,0.02)",
                                overflow: "hidden",
                            }}
                        >
                            <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>
                  {filteredErrors.length} hata gösteriliyor
                </span>
                            </div>
                            {filteredErrors.map((error, i) => {
                                const sev = severityConfig[error.severity];
                                return (
                                    <div
                                        key={error.id}
                                        className="error-row"
                                        onClick={() => runAnalysis(error)}
                                        style={{
                                            padding: "16px 20px",
                                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                                            animation: `slideIn 0.3s ease ${i * 0.05}s forwards`,
                                            opacity: 0,
                                            backgroundColor: selectedError?.id === error.id ? "rgba(255,255,255,0.04)" : "transparent",
                                            borderLeft: selectedError?.id === error.id ? `2px solid ${sev.color}` : "2px solid transparent",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                                            <div style={{ marginTop: 4 }}>
                                                <Pulse color={sev.color} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                          <span
                              className="tag"
                              style={{
                                  backgroundColor: error.type === "frontend" ? "rgba(123,104,238,0.15)" : "rgba(0,212,170,0.15)",
                                  color: error.type === "frontend" ? "#7b68ee" : "#00d4aa",
                              }}
                          >
                            {error.type}
                          </span>
                                                    <span className="tag" style={{ backgroundColor: sev.bg, color: sev.color }}>
                            {sev.label}
                          </span>
                                                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace", marginLeft: "auto" }}>
                            ×{error.count}
                          </span>
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        fontFamily: "'JetBrains Mono', monospace",
                                                        fontWeight: 400,
                                                        color: "rgba(255,255,255,0.8)",
                                                        lineHeight: 1.5,
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {error.message}
                                                </div>
                                                <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
                            📁 {error.source}
                          </span>
                                                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
                            🕐 {timeAgo(error.timestamp)}
                          </span>
                                                    {error.url && (
                                                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
                              🔗 {error.url}
                            </span>
                                                    )}
                                                    {error.endpoint && (
                                                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
                              🌐 {error.endpoint}
                            </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* AI Analysis Panel */}
                    <div
                        style={{
                            width: 400,
                            flexShrink: 0,
                            borderRadius: 14,
                            border: "1px solid rgba(255,255,255,0.06)",
                            backgroundColor: "rgba(255,255,255,0.02)",
                            overflow: "hidden",
                            position: "sticky",
                            top: 24,
                        }}
                    >
                        <div
                            style={{
                                padding: "16px 20px",
                                borderBottom: "1px solid rgba(255,255,255,0.06)",
                                background: "linear-gradient(135deg, rgba(123,104,238,0.08), rgba(0,212,170,0.05))",
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <span style={{ fontSize: 18 }}>🧠</span>
                            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.5 }}>AI Hata Analizi</span>
                        </div>

                        <div style={{ padding: 20 }}>
                            {!selectedError && !analyzing && (
                                <div style={{ textAlign: "center", padding: "40px 20px", animation: "fadeIn 0.5s ease" }}>
                                    <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>🔍</div>
                                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
                                        Bir hataya tıklayarak<br />AI analizi başlatın
                                    </p>
                                </div>
                            )}

                            {analyzing && (
                                <div style={{ textAlign: "center", padding: "40px 20px", animation: "fadeIn 0.3s ease" }}>
                                    <div
                                        style={{
                                            width: 48,
                                            height: 48,
                                            margin: "0 auto 20px",
                                            borderRadius: "50%",
                                            border: "2px solid rgba(123,104,238,0.2)",
                                            borderTopColor: "#7b68ee",
                                            animation: "spin 1s linear infinite",
                                        }}
                                    />
                                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>
                                        Hata analiz ediliyor...
                                    </p>
                                    <div
                                        style={{
                                            marginTop: 12,
                                            height: 3,
                                            borderRadius: 2,
                                            background: "linear-gradient(90deg, transparent, #7b68ee, transparent)",
                                            backgroundSize: "200% 100%",
                                            animation: "shimmer 1.5s linear infinite",
                                        }}
                                    />
                                </div>
                            )}

                            {analysis && !analyzing && selectedError && (
                                <div style={{ animation: "fadeIn 0.5s ease" }}>
                                    {/* Error info */}
                                    <div style={{ marginBottom: 20, padding: "12px 14px", borderRadius: 10, backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>SEÇİLEN HATA</div>
                                        <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.7)", lineHeight: 1.5, wordBreak: "break-all" }}>
                                            {selectedError.message}
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>
                                            Kategori
                                        </div>
                                        <span
                                            className="tag"
                                            style={{
                                                backgroundColor: "rgba(123,104,238,0.12)",
                                                color: "#a78bfa",
                                                fontSize: 11,
                                                padding: "4px 12px",
                                            }}
                                        >
                      {analysis.category}
                    </span>
                                    </div>

                                    {/* Confidence */}
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>
                                            Güven Skoru
                                        </div>
                                        <ConfidenceBar value={analysis.confidence} />
                                    </div>

                                    {/* Root Cause */}
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>
                                            🎯 Kök Neden
                                        </div>
                                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, padding: "12px 14px", borderRadius: 10, backgroundColor: "rgba(255,149,0,0.06)", borderLeft: "3px solid rgba(255,149,0,0.4)" }}>
                                            {analysis.rootCause}
                                        </p>
                                    </div>

                                    {/* Suggestions */}
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>
                                            💡 Çözüm Önerileri
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            {analysis.suggestions.map((s, i) => (
                                                <div key={i} className="suggestion-item" style={{ animationDelay: `${i * 0.1}s` }}>
                                                    <span style={{ color: "#00d4aa", marginRight: 8, fontWeight: 600 }}>{i + 1}.</span>
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Stack Trace */}
                                    <div>
                                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>
                                            📋 Stack Trace
                                        </div>
                                        <pre
                                            style={{
                                                padding: "14px",
                                                borderRadius: 10,
                                                backgroundColor: "rgba(0,0,0,0.3)",
                                                border: "1px solid rgba(255,255,255,0.05)",
                                                fontSize: 10,
                                                fontFamily: "'JetBrains Mono', monospace",
                                                color: "rgba(255,255,255,0.4)",
                                                lineHeight: 1.8,
                                                overflowX: "auto",
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-all",
                                            }}
                                        >
                      {selectedError.stack}
                    </pre>
                                    </div>

                                    {analysis.relatedErrors?.length > 0 && (
                                        <div style={{ marginTop: 16 }}>
                                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>
                                                🔗 İlişkili Hatalar
                                            </div>
                                            {analysis.relatedErrors.map((rid) => {
                                                const re = errors.find((e) => e.id === rid);
                                                return re ? (
                                                    <div
                                                        key={rid}
                                                        onClick={() => runAnalysis(re)}
                                                        style={{
                                                            padding: "8px 12px",
                                                            borderRadius: 8,
                                                            backgroundColor: "rgba(255,255,255,0.03)",
                                                            border: "1px solid rgba(255,255,255,0.05)",
                                                            fontSize: 11,
                                                            fontFamily: "'JetBrains Mono', monospace",
                                                            color: "rgba(255,255,255,0.5)",
                                                            cursor: "pointer",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        #{re.id} · {re.message}
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}