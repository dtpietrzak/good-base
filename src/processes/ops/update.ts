import type { AuthProps } from "../_types.ts";

type UpdateProps = AuthProps & {
  index: string;
  key: string;
  value: string;
  upsert?: string;
};

export default function update(props: UpdateProps) {
  console.log("Running update: " + JSON.stringify(props));
  return { success: true, data: props };
}
