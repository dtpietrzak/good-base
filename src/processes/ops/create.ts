import type { AuthProps } from "../_types.ts";
import { getConfig, getDirectories } from "../../config/state.ts";
import { z } from "zod";
import JSON5 from "json5";

type CreateProps = AuthProps & {
  db: string;
  index: string;
  key: string;
  value: string;
  auth: string;
  upsert?: boolean;
};

type PrimitiveType = string | number | boolean | null;
type ValueType = PrimitiveType | ValueType[] | { [key: string]: ValueType };

type DatabaseItem = {
  [key: string]: ValueType;
  id: string;
  createdAt: string;
  updatedAt: string | null;
  auth: {
    read: string[];
    update: string[];
    delete: string[];
  };
};

export default async function create(props: CreateProps) {
  const config = getConfig();
  const dbConfig = config.databases[props.db];
  const directories = getDirectories();
  if (!directories.databases[props.db]) {
    return {
      success: false,
      error: "Database does not exist",
    };
  }
  const dbDataBasePath = directories.databases[props.db].data;
  const indexMeta = await getIndexMeta(dbDataBasePath);

  if (props.index === "primary") {
    // primary index is special, it always exists, and is always json
  } else {
    // check if index exists
    if (indexMeta[props.index]) {
      // index exists
    } else {
      return {
        success: false,
        error:
          "Index does not exist - Create the index first using 'index-create'",
      };
    }
  }

  let parsedValue: Record<string, ValueType> = {};

  try {
    const parseError = {
      json: null as string | null,
      json5: null as string | null,
    };
    try {
      parsedValue = JSON.parse(props.value);
    } catch {
      parseError.json = "Invalid JSON";
    }
    try {
      parsedValue = JSON5.parse(props.value);
    } catch {
      parseError.json5 = "Invalid JSON5";
    }
    if (parseError.json && parseError.json5) {
      console.log("both json and json5 failed");
      return {
        success: false,
        error:
          `Value must be valid JSON or JSON5 - JSON: ${parseError.json} - JSON5: ${parseError.json5}`,
      };
    }
    // zod parse to ensure its an object containing only value types
    // Base primitives
    const baseValueSchema = z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.null(),
    ]);
    // Recursive schema using z.lazy
    // deno-lint-ignore no-explicit-any
    const valueSchema: z.ZodType<any> = z.lazy(() =>
      z.union([
        baseValueSchema, // primitives
        z.array(valueSchema), // arrays of values
        z.record(z.string(), valueSchema), // objects with string keys
      ])
    );
    parsedValue = valueSchema.parse(parsedValue);
    // if it passes, we are good
    // otherwise, it will throw and be caught below
    delete parsedValue.id;
    delete parsedValue.createdAt;
    delete parsedValue.updatedAt;
    delete parsedValue.auth;
  } catch (error) {
    return {
      success: false,
      error: `Value must be a valid JSON object - ${error}`,
    };
  }

  const savePath = `${dbDataBasePath}/${props.index}/${props.key}.json`;
  try {
    const existingData = await Deno
      .readTextFile(savePath)
      .catch(() => undefined);

    if (!props.upsert) {
      if (existingData) {
        return {
          success: false,
          error: "Key already exists - Use upsert to merge",
        };
      }

      const createValue: DatabaseItem = {
        ...parsedValue,
        id: props.key,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        auth: {
          read: [props.auth],
          update: [props.auth],
          delete: [props.auth],
        },
      };
      // save new file
      await Deno.writeTextFile(
        savePath,
        JSON.stringify(createValue, null, 2),
      );
      return { success: true, data: createValue };
    } else {
      const parsedExistingData: DatabaseItem = existingData
        ? JSON.parse(existingData)
        : {
          id: props.key,
          createdAt: new Date().toISOString(),
          updatedAt: null,
          auth: {
            read: [props.auth],
            update: [props.auth],
            delete: [props.auth],
          },
        };

      if (parsedExistingData.auth.update.includes(props.auth) === false) {
        return {
          success: false,
          error:
            "Unauthorized - You do not have permission to modify this item",
        };
      }

      const newData = {
        ...parsedExistingData,
        ...parsedValue,
        updatedAt: new Date().toISOString(),
      };
      await Deno.writeTextFile(savePath, JSON.stringify(newData, null, 2));
      return { success: true, data: newData };
    }
    // deno-lint-ignore no-explicit-any
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to save data: ${error?.message || error}`,
    };
  }
}

type IndexMetaItem = {
  level: "match" | "traverse" | "full";
};

type IndexMeta = Record<string, IndexMetaItem>;

const getIndexMeta = async (dbDataBasePath: string) => {
  const indexMetaPath = `${dbDataBasePath}/_index_meta.json`;
  // load index meta
  // if index does not exist, create it
  // if it does, load it
  const unparsedIndexMeta = await Deno.readTextFile(indexMetaPath)
    .catch(() => undefined);

  if (!unparsedIndexMeta) {
    const defaultIndexMeta: IndexMeta = {
      primary: {
        level: "match", // match | traverse | full
      },
    };
    await Deno.writeTextFile(
      indexMetaPath,
      JSON.stringify(defaultIndexMeta, null, 2),
    );
    return defaultIndexMeta;
  }

  const indexMeta = JSON.parse(unparsedIndexMeta) as IndexMeta;

  Object.keys(indexMeta).map(async (key) => {
    const indexMetaPath = `${dbDataBasePath}/${key}`;
    const dirExists = await Deno.stat(indexMetaPath).catch(() => undefined);
    if (!dirExists || !dirExists.isDirectory) {
      Deno.mkdirSync(indexMetaPath);
    }
  });

  return indexMeta;
};
