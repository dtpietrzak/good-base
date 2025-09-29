import type { AuthProps } from "./_types.ts";

type SearchProps = AuthProps & {
  index: string;
  query: string;
  limit?: number;
  offset?: number;
};

export default function search(props: SearchProps) {
  console.log("Running search: " + JSON.stringify(props));
  return { success: true, data: props };
}
