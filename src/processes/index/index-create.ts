import { AuthProps } from "../_types.ts";

type IndexProps = AuthProps & {
  name: string;
};

export default function index(props: IndexProps) {
  console.log("Running index: " + JSON.stringify(props));
  return { success: true, data: props };
}
