import { NotionService } from "../../lib/notion";

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case "GET":
        const activities = await NotionService.getActivities();
        res.status(200).json({ success: true, data: activities });
        break;

      case "POST":
        const { tanggal, waktu, kategori, catatan, jumlah } = req.body;

        if (!tanggal || !waktu || !kategori) {
          return res.status(400).json({
            success: false,
            error: "Tanggal, waktu, dan kategori harus diisi!",
          });
        }

        await NotionService.createActivity({
          tanggal,
          waktu,
          kategori,
          catatan,
          jumlah,
        });
        res
          .status(201)
          .json({ success: true, message: "Data berhasil ditambahkan!" });
        break;

      case "DELETE":
        const { id, clearAll } = req.body;

        if (clearAll) {
          await NotionService.clearAllActivities();
          res
            .status(200)
            .json({ success: true, message: "Semua data berhasil dihapus!" });
        } else if (id) {
          await NotionService.deleteActivity(id);
          res
            .status(200)
            .json({ success: true, message: "Data berhasil dihapus!" });
        } else {
          res.status(400).json({ success: false, error: "ID tidak valid!" });
        }
        break;

      default:
        res.setHeader("Allow", ["GET", "POST", "DELETE"]);
        res
          .status(405)
          .json({
            success: false,
            error: `Method ${req.method} tidak diizinkan`,
          });
    }
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      success: false,
      error: "Terjadi kesalahan server",
      details: error.message,
    });
  }
}
