import fs from "fs";

import NotionApiService from "./notionApiService.js";
import { toKebabCase } from "./helpers.js";

const notionApiService = new NotionApiService();

const createMatchupMarkdown = (matchup) => {
  return `# ${matchup.Name}
  ## Description
  ${matchup.Description}
  ## Winner
  ${matchup.Winner}`;
};

const createRestaurantMarkdown = (restaurant) => {
  const properties = restaurant.properties;

  return `
---
title: '${properties.Name.title[0].text.content}'
date: '${properties.Date.date.start}'
wins: ${properties.Wins.number}
defeatedBy: ${
    properties.defeatedBy.rich_text.length
      ? properties.defeatedBy.rich_text[0].text.content
      : "null"
  }
---
  
# ${properties.Name.title[0].text.content}
    
${properties.Description.rich_text[0].text.content}`;
};

const updateMetadataConst = (metadata) => {
  const metadataObj = {
    kingName: metadata.properties.kingName.rich_text[0].text.content,
  };

  fs.writeFileSync(
    "../src/consts.ts",
    `export const metadata = ${JSON.stringify(metadataObj)}`
  );
};

const main = async () => {
  // const res = await notionApiService.queryDatabase(METADATA_DB_ID);
  const res = await notionApiService.getAllDatabaseIds();

  console.log(res);

  // const log = res.data.response;

  // console.log(log);

  // const databases = log.results.filter(
  //   (result) => result.type === "child_database"
  // );
  // const restaurantId = databases[0].id;
  // const metadataId = databases[1].id;
  // const matchupId = databases[2].id;

  const { restaurantId, metadataId, matchupId } = res;

  const metadata = await notionApiService.queryDatabase(metadataId);

  updateMetadataConst(metadata.data.response.results[0]);

  const restaurant = await notionApiService.queryDatabase(restaurantId);

  const results = restaurant.data.response.results;

  results.forEach((result) => {
    const fileName = toKebabCase(result.properties.Name.title[0].text.content);
    const markdown = createRestaurantMarkdown(result);
    fs.writeFileSync(`../src/content/restaurants/${fileName}.md`, markdown);
  });

  // createRestaurantMarkdown(restaurant.data.response.results);

  // const matchup = await notionApiService.queryDatabase(matchupId);
};

main();
