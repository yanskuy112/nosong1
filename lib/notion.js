import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

export class NotionService {
  // Create new activity
  static async createActivity(data) {
    try {
      const response = await notion.pages.create({
        parent: {
          database_id: DATABASE_ID,
        },
        properties: {
          Tanggal: {
            date: {
              start: data.tanggal,
            },
          },
          Waktu: {
            rich_text: [
              {
                text: {
                  content: data.waktu,
                },
              },
            ],
          },
          Kategori: {
            select: {
              name: data.kategori,
            },
          },
          Catatan: {
            rich_text: [
              {
                text: {
                  content: data.catatan || "",
                },
              },
            ],
          },
          Jumlah: {
            number: parseInt(data.jumlah) || 0,
          },
        },
      });
      return response;
    } catch (error) {
      console.error("Error creating activity:", error);
      throw error;
    }
  }

  // Get all activities
  static async getActivities() {
    try {
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        sorts: [
          {
            property: "Tanggal",
            direction: "descending",
          },
          {
            property: "Waktu",
            direction: "descending",
          },
        ],
      });

      return response.results.map((page) => ({
        id: page.id,
        tanggal: page.properties.Tanggal?.date?.start || "",
        waktu: page.properties.Waktu?.rich_text?.[0]?.text?.content || "",
        kategori: page.properties.Kategori?.select?.name || "",
        catatan: page.properties.Catatan?.rich_text?.[0]?.text?.content || "",
        jumlah: page.properties.Jumlah?.number || 0,
      }));
    } catch (error) {
      console.error("Error fetching activities:", error);
      throw error;
    }
  }

  // Delete activity
  static async deleteActivity(pageId) {
    try {
      await notion.pages.update({
        page_id: pageId,
        archived: true,
      });
      return true;
    } catch (error) {
      console.error("Error deleting activity:", error);
      throw error;
    }
  }

  // Clear all activities
  static async clearAllActivities() {
    try {
      const activities = await this.getActivities();
      const deletePromises = activities.map((activity) =>
        this.deleteActivity(activity.id)
      );
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error("Error clearing all activities:", error);
      throw error;
    }
  }
}
