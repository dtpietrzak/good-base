import type { AuthProps } from "../_types.ts";

type ReadProps = AuthProps & {
  db: string;
  index: string;
  key: string;
  auth: string;
};

export default function read(props: ReadProps) {
  console.log("Running read: " + JSON.stringify(props));
  return { success: true, data: props };
}
