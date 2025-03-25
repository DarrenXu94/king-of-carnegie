const { Client } = require("@notionhq/client");
require("dotenv").config({ path: "../.env" });

const MAINID = process.env.NETLIFY_DB_MAIN_ID; // ID of the main page

class NotionApiService {
  constructor() {
    // If localhost create a notion client object and save in class locally, otherwise use api calls
    this.notion = new Client({ auth: process.env.NETLIFY_NOTION_KEY });
  }

  async getDatabase(databaseId) {
    const response = await this.notion.databases.retrieve({
      database_id: databaseId,
    });
    return {
      statusCode: 200,
      data: { response },
    };
  }

  async queryDatabase(databaseId, opts = {}) {
    const response = await this.notion.databases.query({
      database_id: databaseId,
      ...opts,
    });

    return {
      statusCode: 200,
      data: { response },
    };
  }

  async getAllBlogs() {
    const response = await this.notion.blocks.children.list({
      block_id: MAINID,
      page_size: 50,
    });
    return {
      statusCode: 200,

      data: { response },
    };
  }

  async getAllDatabaseIds() {
    const res = await this.getAllBlogs();

    const log = res.data.response;
    const databases = log.results.filter(
      (result) => result.type === "child_database"
    );
    const restaurantId = databases[0].id;
    const metadataId = databases[1].id;
    const matchupId = databases[2].id;

    return {
      restaurantId,
      metadataId,
      matchupId,
    };
  }

  async getPageData(id) {
    const response = await this.notion.pages.retrieve({
      page_id: id,
      page_size: 50,
    });
    return {
      statusCode: 200,

      data: { response },
    };
  }

  async getPageContent(id) {
    const response = await this.notion.blocks.children.list({
      block_id: id,
      page_size: 50,
    });
    return {
      statusCode: 200,

      data: { response },
    };
  }

  async createPage(newEntry) {
    const response = await this.notion.pages.create(newEntry);
    return {
      statusCode: 200,
      data: { response },
    };
  }

  async updateRow(id, newEntry) {
    const response = await this.notion.pages.update({
      page_id: id,
      properties: newEntry,
    });
    return {
      statusCode: 200,
      data: { response },
    };
  }
}

module.exports = NotionApiService;
