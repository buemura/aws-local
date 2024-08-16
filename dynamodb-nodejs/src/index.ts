import { DynamoDB, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

const tableName = "User";

// Set the region and endpoint
const dynamoDB = new DynamoDB({
  endpoint: "http://localhost:8000",
  region: "us-west-2",
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local",
  },
});

// Example function to create a table
const createTable = async () => {
  try {
    const data = await dynamoDB.createTable({
      TableName: tableName,
      KeySchema: [
        { AttributeName: "PK", KeyType: "HASH" }, // Partition key
        { AttributeName: "SK", KeyType: "RANGE" }, // Sort key
      ],
      AttributeDefinitions: [
        { AttributeName: "PK", AttributeType: "S" },
        { AttributeName: "SK", AttributeType: "S" },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    });
    console.log("Table created:", data);
  } catch (error) {
    console.error("Error creating table:", error);
  }
};

// Example function to put an item
const putItem = async () => {
  try {
    const transaction = new TransactWriteItemsCommand({
      TransactItems: [
        {
          Put: {
            TableName: tableName,
            Item: marshall({
              PK: "USER_HISTORY#123",
              SK: "2024-08-17T18:00:00.000Z",
              Name: "dalksjldkasjdlkasjdlkjasldjaslkdj",
              Status: "03",
              Type: "01",
              Operation: "upd",
            }),
            ConditionExpression:
              "attribute_not_exists(PK) AND attribute_not_exists(SK)",
          },
        },
        {
          Put: {
            TableName: tableName,
            Item: marshall({
              PK: "USER#123",
              SK: "01#dalksjldkasjdlkasjdlkjasldjaslkdj",
              Name: "dalksjldkasjdlkasjdlkjasldjaslkdj",
              Status: "03",
              Type: "01",
            }),
          },
        },
      ],
    });

    const data = await dynamoDB.send(transaction);

    console.log("Item inserted:", data);
  } catch (error) {
    console.error("Error inserting item:", error);
  }
};

// Run the functions
async function execute() {
  await createTable();
  await putItem();
}
execute();
