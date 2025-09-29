import type { AuthProps } from "../_types.ts";

type DeleteProps = AuthProps & {
  index: string;
  key: string;
};

export default function deleteOp(props: DeleteProps) {
  console.log("Running delete: " + JSON.stringify(props));
  return { success: true, data: props };
}
