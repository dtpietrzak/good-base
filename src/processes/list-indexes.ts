import type { AuthProps } from "./_types.ts";

type ListIndexesProps = AuthProps;

export default function listIndexes(props: ListIndexesProps) {
  console.log("Running list-indexes: " + JSON.stringify(props));
  return { success: true, data: props };
}
