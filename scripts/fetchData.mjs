import fs from "fs";

import NotionApiService from "./notionApiService.js";
import { toKebabCase } from "./helpers.js";

const notionApiService = new NotionApiService();

const createMatchupMarkdown = (matchup) => {
  const properties = matchup.properties;

  return `
  ---
  title: '${properties.Name.title[0].text.content}'
  reviewDate: '${matchup.created_time}'
  winner: '${properties.Winner.rich_text[0].text.content}'
  ---
    
  # ${properties.Name.title[0].text.content}
      
  ${properties.Description.rich_text[0].text.content}`;
};

const createRestaurantMarkdown = (restaurant) => {
  const properties = restaurant.properties;

  return `
---
title: '${properties.Name.title[0].text.content}'
reviewDate: '${properties.Date.date.start}'
wins: ${properties.Wins.number}
defeatedBy: '${
    properties.defeatedBy.rich_text.length
      ? properties.defeatedBy.rich_text[0].text.content
      : "null"
  }'
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
  const res = await notionApiService.getAllDatabaseIds();

  const { restaurantId, metadataId, matchupId } = res;

  const metadata = await notionApiService.queryDatabase(metadataId);

  updateMetadataConst(metadata.data.response.results[0]);

  const restaurants = await notionApiService.queryDatabase(restaurantId);

  const results = restaurants.data.response.results;

  results.forEach((result) => {
    const fileName = toKebabCase(result.properties.Name.title[0].text.content);
    const markdown = createRestaurantMarkdown(result);
    fs.writeFileSync(`../src/content/restaurants/${fileName}.md`, markdown);
  });

  const matchup = await notionApiService.queryDatabase(matchupId);

  const matchups = matchup.data.response.results;

  matchups.forEach((matchup) => {
    const fileName = toKebabCase(matchup.properties.Name.title[0].text.content);
    const markdown = createMatchupMarkdown(matchup);
    fs.writeFileSync(`../src/content/matchups/${fileName}.md`, markdown);
  });
};

main();
