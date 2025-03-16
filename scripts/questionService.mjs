import inquirer from "inquirer";

import NotionApiService from "./notionApiService.js";

const notionApiService = new NotionApiService();
let RESTAURANT_DB_ID = "";
let METADATA_DB_ID = "";
let MATCHUP_DB_ID = "";

const generateQuestions = (kingName) => {
  // The questions
  const questions = [
    {
      type: "input",
      name: "name",
      message: "What the name of the restaurant?",
    },
    {
      type: "input",
      name: "date",
      message: "When did you visit? Leave blank for today.",
      default: new Date(),
    },
    {
      type: "editor",
      name: "description",
      message: "Give a description of the restaurant",
    },
    {
      type: "editor",
      name: "matchupDescription",
      message: `Give a description of the match up against ${kingName}`,
    },
    {
      type: "list",
      name: "wasItBetter",
      message: `Was it better than ${kingName}?`,
      choices: ["Yes", "No"],
    },
  ];

  return questions;
};

const askQuestions = (kingName) => {
  return new Promise((resolve, reject) => {
    inquirer.prompt(generateQuestions(kingName)).then((answers) => {
      console.log(answers);
      resolve(answers);
    });
  });
};

const fetchMetadata = async () => {
  const res = await notionApiService.queryDatabase(METADATA_DB_ID);

  const log = res.data.response;

  return {
    name: log.results[0].properties.kingName.rich_text[0].plain_text,
    id: log.results[0].id,
  };
};

const createNewRestaurantEntry = async (answers) => {
  const newEntry = {
    parent: { database_id: RESTAURANT_DB_ID },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: answers.name,
            },
          },
        ],
      },
      Date: {
        date: {
          start: answers.date,
        },
      },
      Description: {
        rich_text: [
          {
            text: {
              content: answers.description,
            },
          },
        ],
      },
      Wins: {
        number: answers.wasItBetter === "Yes" ? 1 : 0,
      },
    },
  };

  console.log(newEntry);

  // update restaurant db

  const res = await notionApiService.createPage(newEntry);

  console.log(res);
};

const updateMetadata = async (answers, metadataRowId) => {
  if (answers.wasItBetter === "Yes") {
    // do a put request to update the config

    const newConfig = {
      kingName: {
        rich_text: [
          {
            text: {
              content: answers.name,
            },
          },
        ],
      },
    };

    const res = await notionApiService.updateRow(metadataRowId, newConfig);

    console.log(res);

    console.log("Updated the config");
  }
};

const createMatchupEntry = async (answers, kingName) => {
  // create new matchup row
  const newMatchupEntry = {
    parent: { database_id: MATCHUP_DB_ID },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: `${answers.name} vs ${kingName}`,
            },
          },
        ],
      },
      Description: {
        rich_text: [
          {
            text: {
              content: answers.matchupDescription,
            },
          },
        ],
      },
      Winner: {
        rich_text: [
          {
            text: {
              content: answers.wasItBetter === "Yes" ? answers.name : kingName,
            },
          },
        ],
      },
    },
  };

  console.log(newMatchupEntry);

  const res2 = await notionApiService.createPage(newMatchupEntry);

  console.log(res2);

  console.log("Created the matchup");
};

// if wasItBetter is yes then update the original king defeatedBy column
const updateOriginalKing = async (answers, name) => {
  if (answers.wasItBetter === "Yes") {
    // get id for restaurant
    const query = await notionApiService.queryDatabase(RESTAURANT_DB_ID, {
      filter: {
        property: "Name",
        rich_text: {
          equals: name,
        },
      },
    });

    const restaurantId = query.data.response.results[0].id;

    // do a put request to update the config

    const newConfig = {
      defeatedBy: {
        rich_text: [
          {
            text: {
              content: answers.name,
            },
          },
        ],
      },
    };

    const res = await notionApiService.updateRow(restaurantId, newConfig);

    console.log(res);
  }
};

const updateDatabase = async (answers, metadataRowId, name) => {
  await createNewRestaurantEntry(answers);
  await updateMetadata(answers, metadataRowId);
  await createMatchupEntry(answers, name);
  await updateOriginalKing(answers, name);
};

const getIds = async () => {
  const res = await notionApiService.getAllBlogs();

  const log = res.data.response;

  const databases = log.results.filter(
    (result) => result.type === "child_database"
  );
  const restaurantId = databases[0].id;
  const metadataId = databases[1].id;
  const matchupId = databases[2].id;

  RESTAURANT_DB_ID = restaurantId;
  METADATA_DB_ID = metadataId;
  MATCHUP_DB_ID = matchupId;
};

const main = async () => {
  await getIds();
  const { name, id } = await fetchMetadata();
  const answers = await askQuestions(name);

  updateDatabase(answers, id, name);
};

main();
