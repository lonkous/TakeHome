import {
  PartitionKeyDefinitionVersion,
  PartitionKeyKind,
  Database,
  CosmosClient,
  Container,
  CosmosDbDiagnosticLevel,
  ErrorResponse,
  RestError,
  AbortError,
  TimeoutError,
} from "@azure/cosmos";

import config from "@/config/env.server";

let client: CosmosClient;
let database: Database;
let dataContainer: Container;

async function initializeCosmosDB(): Promise<void> {
  try {
    client = new CosmosClient({
      endpoint: config.cosmos.endpoint,
      key: config.cosmos.key,
      diagnosticLevel: CosmosDbDiagnosticLevel.debug,
    });

    const { database: db } = await client.databases.createIfNotExists({
      id: config.cosmos.database,
    });
    database = db;

    console.log(`Database '${config.cosmos.database}' initialized.`);

    dataContainer = await createDatasContainer();

    console.log("Cosmos DB initialized successfully.");
  } catch (error: any) {
    return handleCosmosError(error);
  }
}

async function createDatasContainer(): Promise<Container> {
  const containerDefinition = {
    id: config.cosmos.containers.datas,
    partitionKey: {
      paths: ["/id"],
      version: PartitionKeyDefinitionVersion.V2,
      kind: PartitionKeyKind.Hash,
    },
  };

  try {
    const { container } =
      await database.containers.createIfNotExists(containerDefinition);
    console.log(`'${container.id}' is ready.`);
    return container;
  } catch (error: any) {
    return handleCosmosError(error);
  }
}

function getDataContainer(): Container {
  if (!dataContainer) {
    throw new Error(
      "data container is not initialized. Call initializeCosmosDB() first.",
    );
  }
  return dataContainer;
}

const handleCosmosError = (error: any): never => {
  if (error instanceof RestError) {
    throw new Error(`error: ${error.name},  message: ${error.message}`);
  } else if (error instanceof ErrorResponse) {
    throw new Error(`Error: ${error.message}, message: ${error.message}`);
  } else if (error instanceof AbortError) {
    throw new Error(error.message);
  } else if (error instanceof TimeoutError) {
    throw new Error(
      `TimeoutError code: ${error.code}, message: ${error.message}`,
    );
  } else if (error.code === 409) {
    throw new Error(
      "Conflict occurred while creating an item using an existing ID.",
    );
  } else {
    console.log(JSON.stringify(error));
    throw new Error("An error occurred while processing your request.");
  }
};

export { initializeCosmosDB, getDataContainer, handleCosmosError };
