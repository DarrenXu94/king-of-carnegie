import NotionApiService from "./notionApiService.js";

const notionApiService = new NotionApiService();

const main = async () => {
  // const res = await notionApiService.queryDatabase(METADATA_DB_ID);
  const res = await notionApiService.getAllBlogs();

  const log = res.data.response;

  console.log(log);

  const databases = log.results.filter(
    (result) => result.type === "child_database"
  );
  const restaurantId = databases[0].id;
  const metadataId = databases[1].id;
  const matchupId = databases[2].id;
};

main();
