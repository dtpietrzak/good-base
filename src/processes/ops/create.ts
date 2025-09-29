import type { AuthProps } from "../_types.ts";

type CreateProps = AuthProps & {
  index: string;
  key: string;
  value: string;
  upsert?: string;
};

export default function create(props: CreateProps) {
  console.log("Running create: " + JSON.stringify(props));
  return { success: true, data: props };
}
