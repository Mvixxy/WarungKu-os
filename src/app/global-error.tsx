"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body>
        <div style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: "16px",
        }}>
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <div style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "16px",
            }}>
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "16px",
                backgroundColor: "#FEE2E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <span style={{ fontSize: "28px", fontWeight: 700, color: "#DC2626" }}>!</span>
              </div>
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>
              Terjadi kesalahan
            </h1>
            <p style={{ fontSize: "14px", color: "#78716C", marginBottom: "20px" }}>
              Aplikasi mengalami error yang tidak terduga. Coba muat ulang halaman.
            </p>
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: "#8B5E3C",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Muat Ulang
            </button>
            {error.digest && (
              <p style={{ fontSize: "11px", color: "#A8A29E", marginTop: "12px" }}>
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
