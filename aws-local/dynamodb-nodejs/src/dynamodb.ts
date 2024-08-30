import {
  DynamoDB,
  GetItemCommand,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { UserInput } from "./types";

const tableName = "User";

const dynamoDB = new DynamoDB({
  endpoint: "http://localhost:8000",
  region: "us-west-2",
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local",
  },
});

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

export const putItem = async (input: UserInput) => {
  try {
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

    const existingUser = await findByReference({
      id: input.id,
      referenceId: input.referenceId,
      type: input.type,
      consistentRead: true,
    });

    const existingTransactionDate = unmarshall(existingUser!)?.TransactionDate;

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
