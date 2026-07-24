import { eq } from "drizzle-orm";
import { dbClient, dbConn } from "@db/client.js";
import { todoTable } from "@db/schema.js";

async function insertData() {
  await dbClient.insert(todoTable).values({
    userId: "f3e1c8b0-5d6a-4f9e-8c2b-1a2b3c4d5e6f",
    todoText: "Finish reading",
  });
  dbConn.end();
}

async function queryData() {
  const results = await dbClient.query.todoTable.findMany();
  console.log(results);
  dbConn.end();
}

async function updateData() {
  const results = await dbClient.query.todoTable.findMany();
  if (results.length === 0) dbConn.end();

  const id = results[0].id;
  await dbClient
    .update(todoTable)
    .set({
      todoText: "AAA",
    })
    .where(eq(todoTable.id, id));
  dbConn.end();
}

async function deleteData() {
  const results = await dbClient.query.todoTable.findMany();
  if (results.length === 0) dbConn.end();

  const id = results[0].id;
  await dbClient.delete(todoTable).where(eq(todoTable.id, id));
  dbConn.end();
}

// insertData();
queryData();
// updateData();
// deleteData();
