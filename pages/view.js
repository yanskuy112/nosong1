import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function ViewData() {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    if (filterCategory) {
      setFilteredActivities(
        activities.filter((item) => item.kategori === filterCategory)
      );
    } else {
      setFilteredActivities(activities);
    }
  }, [activities, filterCategory]);

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/activities");
      const result = await response.json();
      if (result.success) {
        setActivities(result.data);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
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

  const handleClearAll = async () => {
    if (
      !confirm(
        "Yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan!"
      )
    )
      return;

    try {
      const response = await fetch("/api/activities", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clearAll: true }),
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

  // Get category statistics
  const categoryStats = activities.reduce((acc, item) => {
    acc[item.kategori] = (acc[item.kategori] || 0) + 1;
    return acc;
  }, {});

  // Get category total amounts
  const categoryTotals = activities.reduce((acc, item) => {
    acc[item.kategori] = (acc[item.kategori] || 0) + (item.jumlah || 0);
    return acc;
  }, {});

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case "Competitive Trading":
        return "category-competitive";
      case "Fee":
        return "category-fee";
      case "Cair AirDrop":
        return "category-airdrop";
      default:
        return "category-competitive";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Competitive Trading":
        return "💹";
      case "Fee":
        return "💰";
      case "Cair AirDrop":
        return "🎁";
      default:
        return "📂";
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">⏳ Memuat data...</div>
        <style jsx>{`
          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .loading-spinner {
            background: white;
            padding: 20px 40px;
            border-radius: 15px;
            font-size: 18px;
            font-weight: bold;
            color: #333;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Data Kegiatan Harian</title>
        <meta
          name="description"
          content="Laporan lengkap aktivitas harian Anda"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <div className="header">
          <h1>📊 Data Kegiatan Harian</h1>
          <p>Laporan lengkap aktivitas Anda</p>
        </div>

        <div className="content">
          <div className="nav-buttons">
            <button
              className="btn btn-primary"
              onClick={() => router.push("/")}
            >
              📝 Tambah Data
            </button>
            <button className="btn btn-secondary active">📊 Lihat Data</button>
            {activities.length > 0 && (
              <button className="btn btn-danger" onClick={handleClearAll}>
                🗑️ Hapus Semua
              </button>
            )}
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

          {activities.length > 0 ? (
            <>
              {/* Statistics */}
              <div className="stats-container">
                <div className="stat-card">
                  <div className="stat-number">{activities.length}</div>
                  <div className="stat-label">Total Kegiatan</div>
                </div>
                {Object.entries(categoryStats).map(([category, count]) => (
                  <div key={category} className="stat-card">
                    <div className="stat-number">{count}</div>
                    <div className="stat-label">{category}</div>
                    <div className="stat-amount">
                      Total: {categoryTotals[category].toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div className="filters">
                <span className="filter-label">🔍 Filter Kategori:</span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Semua Kategori</option>
                  <option value="Competitive Trading">
                    💹 Competitive Trading
                  </option>
                  <option value="Fee">💰 Fee</option>
                  <option value="Cair AirDrop">🎁 Cair AirDrop</option>
                </select>
              </div>

              {/* Data List */}
              <div className="data-container">
                <div className="data-header">
                  📋{" "}
                  {filterCategory
                    ? `${filteredActivities.length} Data ${filterCategory}`
                    : `${activities.length} Total Data`}
                </div>

                <div className="data-list">
                  {filteredActivities.map((item) => (
                    <div key={item.id} className="data-item">
                      <div className="data-item-header">
                        <div className="data-date-time">
                          📅{" "}
                          {new Date(item.tanggal).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}{" "}
                          - 🕒 {item.waktu}
                        </div>
                        <div className="data-actions">
                          <span
                            className={`data-category ${getCategoryBadgeClass(
                              item.kategori
                            )}`}
                          >
                            {getCategoryIcon(item.kategori)} {item.kategori}
                            {item.jumlah > 0 && (
                              <span className="data-amount">
                                {" "}
                                - {item.jumlah.toLocaleString("id-ID")}
                              </span>
                            )}
                          </span>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(item.id)}
                            title="Hapus data ini"
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
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>Belum ada data kegiatan</h3>
              <p>
                Mulai tambahkan kegiatan pertama Anda untuk melihat laporan di
                sini!
              </p>
              <button
                className="btn btn-primary"
                onClick={() => router.push("/")}
              >
                ✨ Tambah Kegiatan Pertama
              </button>
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
          max-width: 1000px;
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
          display: flex;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-block;
          padding: 12px 30px;
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

        .btn-danger {
          background: linear-gradient(135deg, #fd746c 0%, #ff9068 100%);
          color: white;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .btn.active {
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
        }
        .stat-amount {
          font-size: 0.9em;
          margin-top: 5px;
          background: rgba(255, 255, 255, 0.2);
          padding: 5px 10px;
          border-radius: 10px;
          display: inline-block;
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

        .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 25px;
          border-radius: 15px;
          text-align: center;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .stat-number {
          font-size: 2.5em;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .stat-label {
          font-size: 1em;
          opacity: 0.9;
        }

        .filters {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 15px;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .filter-label {
          font-weight: bold;
          color: #333;
        }

        .filter-select {
          padding: 10px 15px;
          border: 2px solid #e1e5e9;
          border-radius: 10px;
          font-size: 16px;
          background: white;
          cursor: pointer;
          transition: border-color 0.3s ease;
        }

        .filter-select:focus {
          outline: none;
          border-color: #667eea;
        }

        .data-container {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }

        .data-header {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          color: #333;
          padding: 20px;
          text-align: center;
          font-weight: bold;
          font-size: 18px;
        }

        .data-list {
          padding: 20px;
          max-height: 600px;
          overflow-y: auto;
        }

        .data-item {
          background: #f8f9fa;
          padding: 20px;
          margin-bottom: 15px;
          border-radius: 15px;
          border-left: 5px solid #667eea;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .data-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .data-item:last-child {
          margin-bottom: 0;
        }

        .data-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .data-date-time {
          font-weight: bold;
          color: #333;
          font-size: 16px;
        }

        .data-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .data-category {
          padding: 8px 15px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          color: white;
        }

        .category-competitive {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .category-fee {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .category-airdrop {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .data-notes {
          color: #666;
          font-style: italic;
          background: #fff;
          padding: 15px;
          border-radius: 10px;
          border-left: 3px solid #ddd;
        }

        .delete-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s ease;
        }

        .delete-btn:hover {
          background: #c82333;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .empty-icon {
          font-size: 5em;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          font-size: 1.5em;
          margin-bottom: 15px;
          color: #333;
        }

        .empty-state p {
          font-size: 1.1em;
          margin-bottom: 30px;
          line-height: 1.6;
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

          .nav-buttons {
            flex-direction: column;
          }

          .btn {
            margin: 5px 0;
          }

          .stats-container {
            grid-template-columns: 1fr;
          }

          .data-item-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .data-actions {
            align-self: flex-end;
          }

          .filters {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </>
  );
}
