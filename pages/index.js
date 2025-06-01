import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Home() {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    waktu: "",
    kategori: "",
    catatan: "",
    jumlah: "",
  });
  const [activities, setActivities] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/activities");
      const result = await response.json();
      if (result.success) {
        setActivities(result.data);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: "success", text: result.message });
        setFormData({
          tanggal: new Date().toISOString().split("T")[0],
          waktu: "",
          kategori: "",
          catatan: "",
          jumlah: "",
        });
        fetchActivities();
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat menyimpan data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;

    try {
      const response = await fetch("/api/activities", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      if (result.success) {
        setMessage({ type: "success", text: result.message });
        fetchActivities();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat menghapus data",
      });
    }
  };

  const recentActivities = activities.slice(0, 3);

  return (
    <>
      <Head>
        <title>Catatan Kegiatan Harian</title>
        <meta
          name="description"
          content="Kelola aktivitas harian Anda dengan mudah"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <div className="header">
          <h1>📝 Catatan Kegiatan Harian</h1>
          <p>Kelola aktivitas harian Anda dengan mudah</p>
        </div>

        <div className="content">
          <div className="nav-buttons">
            <button className="btn btn-primary active">📝 Input Data</button>
            <button
              className="btn btn-secondary"
              onClick={() => router.push("/view")}
            >
              📊 Lihat Semua Data
            </button>
          </div>

          {message.text && (
            <div
              className={`alert ${
                message.type === "success" ? "alert-success" : "alert-error"
              }`}
            >
              {message.type === "success" ? "✅" : "❌"} {message.text}
            </div>
          )}

          <div className="form-container">
            <h2>Tambah Kegiatan Baru</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="tanggal">📅 Tanggal *</label>
                <input
                  type="date"
                  id="tanggal"
                  value={formData.tanggal}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggal: e.target.value })
                  }
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="waktu">🕒 Waktu *</label>
                <input
                  type="time"
                  id="waktu"
                  value={formData.waktu}
                  onChange={(e) =>
                    setFormData({ ...formData, waktu: e.target.value })
                  }
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="kategori">📂 Kategori *</label>
                <select
                  id="kategori"
                  value={formData.kategori}
                  onChange={(e) =>
                    setFormData({ ...formData, kategori: e.target.value })
                  }
                  className="form-control"
                  required
                >
                  <option value="">-- Pilih Kategori --</option>
                  <option value="Competitive Trading">
                    💹 Competitive Trading
                  </option>
                  <option value="Fee">💰 Fee</option>
                  <option value="Cair AirDrop">🎁 Cair AirDrop</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="jumlah">💲 Jumlah *</label>
                <input
                  type="number"
                  id="jumlah"
                  value={formData.jumlah}
                  onChange={(e) =>
                    setFormData({ ...formData, jumlah: e.target.value })
                  }
                  className="form-control"
                  placeholder="Masukkan jumlah"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="catatan">📝 Catatan</label>
                <textarea
                  id="catatan"
                  value={formData.catatan}
                  onChange={(e) =>
                    setFormData({ ...formData, catatan: e.target.value })
                  }
                  className="form-control"
                  placeholder="Tambahkan catatan atau detail kegiatan..."
                />
              </div>

              <div style={{ textAlign: "center" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "⏳ Menyimpan..." : "✨ Tambah Kegiatan"}
                </button>
              </div>
            </form>
          </div>

          {activities.length > 0 ? (
            <div className="data-preview">
              <div className="preview-header">
                📋 Preview Data Terbaru ({activities.length} kegiatan)
              </div>
              <div className="data-list">
                {recentActivities.map((item) => (
                  <div key={item.id} className="data-item">
                    <div className="data-item-header">
                      <div className="data-date-time">
                        📅 {new Date(item.tanggal).toLocaleDateString("id-ID")}{" "}
                        - 🕒 {item.waktu}
                      </div>
                      <div>
                        <span className="data-category">{item.kategori}</span>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(item.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    {item.catatan && (
                      <div className="data-notes">💭 {item.catatan}</div>
                    )}
                  </div>
                ))}

                {activities.length > 3 && (
                  <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => router.push("/view")}
                    >
                      Lihat Semua Data ({activities.length})
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="data-preview">
              <div className="empty-state">
                🌟 Belum ada kegiatan yang dicatat.
                <br />
                Mulai tambahkan kegiatan pertama Anda!
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .header {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }

        .header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .header p {
          font-size: 1.1em;
          opacity: 0.9;
        }

        .content {
          padding: 40px;
        }

        .nav-buttons {
          text-align: center;
          margin-bottom: 30px;
        }

        .btn {
          display: inline-block;
          padding: 12px 30px;
          margin: 0 10px;
          text-decoration: none;
          border-radius: 25px;
          font-weight: bold;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
          font-size: 16px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-secondary {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn.active {
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
        }

        .form-container {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 30px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }

        .form-container h2 {
          margin-bottom: 25px;
          color: #333;
          text-align: center;
        }

        .form-group {
          margin-bottom: 25px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
          font-size: 16px;
        }

        .form-control {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #e1e5e9;
          border-radius: 10px;
          font-size: 16px;
          transition: border-color 0.3s ease;
          background: white;
        }

        .form-control:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        select.form-control {
          cursor: pointer;
        }

        textarea.form-control {
          min-height: 100px;
          resize: vertical;
        }

        .alert {
          padding: 15px 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .alert-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .alert-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .data-preview {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }

        .preview-header {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          color: #333;
          padding: 20px;
          text-align: center;
          font-weight: bold;
          font-size: 18px;
        }

        .data-list {
          padding: 20px;
          max-height: 400px;
          overflow-y: auto;
        }

        .data-item {
          background: #f8f9fa;
          padding: 15px;
          margin-bottom: 15px;
          border-radius: 10px;
          border-left: 4px solid #667eea;
          position: relative;
        }

        .data-item:last-child {
          margin-bottom: 0;
        }

        .data-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .data-date-time {
          font-weight: bold;
          color: #333;
        }

        .data-category {
          background: #667eea;
          color: white;
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: bold;
        }

        .data-notes {
          color: #666;
          font-style: italic;
        }

        .delete-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 12px;
          margin-left: 10px;
        }

        .delete-btn:hover {
          background: #c82333;
        }

        .empty-state {
          text-align: center;
          color: #666;
          font-style: italic;
          padding: 40px;
        }

        @media (max-width: 768px) {
          .container {
            margin: 10px;
          }

          .content {
            padding: 20px;
          }

          .header h1 {
            font-size: 2em;
          }

          .btn {
            display: block;
            margin: 10px 0;
          }
        }
      `}</style>
    </>
  );
}
