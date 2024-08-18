import {
  DynamoDB,
  GetItemCommand,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { UserInput } from "./types";

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
export const createTable = async () => {
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
    console.log("Table created:");
  } catch (error) {
    console.error("Error creating table:");
  }
};

// Example function to put an item
export const putItem = async (input: UserInput) => {
  try {
    // Primeira parte: sempre insere o USER_HISTORY#
    const historyTransaction = new TransactWriteItemsCommand({
      TransactItems: [
        {
          Put: {
            TableName: tableName,
            Item: marshall({
              PK: `USER_HISTORY#${input.id}`,
              SK: input.transactionDate,
              Id: input.id,
              Name: input.name,
              ReferenceId: input.referenceId,
              Status: input.status,
              Type: input.type,
              TransactionDate: input.transactionDate,
              Operation: input.operation,
            }),
          },
        },
      ],
    });

    await dynamoDB.send(historyTransaction);

    // Segunda parte: verificar o transactionDate antes de atualizar o USER#
    const existingUser = await findByReference({
      id: input.id,
      referenceId: input.referenceId,
      type: input.type,
      consistentRead: true,
    });

    const existingTransactionDate = unmarshall(existingUser!)?.TransactionDate;

    // Só atualiza se o novo transactionDate for maior do que o existente
    if (
      !existingTransactionDate ||
      input.transactionDate > existingTransactionDate
    ) {
      await dynamoDB.putItem({
        TableName: tableName,
        Item: marshall({
          PK: `USER#${input.id}`,
          SK: `${input.type}#${input.referenceId}`,
          Id: input.id,
          Name: input.name,
          ReferenceId: input.referenceId,
          Status: input.status,
          Type: input.type,
          TransactionDate: input.transactionDate,
        }),
      });
    } else {
      console.log(
        "Skipping update: existing transactionDate is more recent or equal."
      );
    }

    const data = await findByReference({
      id: input.id,
      referenceId: input.referenceId,
      type: input.type,
      consistentRead: true,
    });

    console.log("Item inserted:", unmarshall(data!));
  } catch (error) {
    console.error("Error inserting item:", error);
  }
};

const findByReference = async ({
  id,
  referenceId,
  type,
  consistentRead = false,
}: {
  id: string;
  referenceId: string;
  type: string;
  consistentRead: boolean;
}) => {
  const command = new GetItemCommand({
    TableName: tableName,
    Key: marshall({
      PK: `USER#${id}`,
      SK: `${type}#${referenceId}`,
    }),
    ConsistentRead: consistentRead,
  });

  const resp = await dynamoDB.send(command);
  return resp.Item;
};
