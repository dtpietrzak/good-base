import type { AuthProps } from "../_types.ts";

type DeleteIndexProps = AuthProps & {
  name: string;
};

export default function deleteIndex(props: DeleteIndexProps) {
  console.log("Running delete-index: " + JSON.stringify(props));
  return { success: true, data: props };
}
