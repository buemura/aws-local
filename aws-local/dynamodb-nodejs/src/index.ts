import { randomBytes, randomUUID } from "node:crypto";
import { createTable, putItem } from "./dynamodb";

// Run the functions
async function execute() {
  await createTable();
  await putItem({
    // id: randomUUID(),
    id: "7ce3a83b-683e-479c-a814-84e9c7f7ade9",
    name: "john doe",
    // referenceId: randomUUID(),
    referenceId: "b434942f-61de-40df-aa83-7b37a7bee92f",
    status: "55",
    type: "222",
    transactionDate: "2024-08-19T03:00:00.000Z",
    operation: "upd",
  });
}
execute();
