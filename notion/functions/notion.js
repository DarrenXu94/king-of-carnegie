const { Client } = require("@notionhq/client");
require("dotenv").config();

const notion = new Client({ auth: process.env.NETLIFY_NOTION_KEY });

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
};

const MAINID = "";

exports.handler = async function (event, context) {
  const id = event.queryStringParameters.id || MAINID;
  const type = event.queryStringParameters.type || "block";

  let response;

  if (type === "page") {
    response = await notion.pages.retrieve({
      page_id: id,
      page_size: 50,
    });
  } else {
    response = await notion.blocks.children.list({
      block_id: id,
      page_size: 50,
    });
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ response }),
  };
};
