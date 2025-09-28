type ReadProps = {
  index: string;
  key: string;
  value: string;
  auth: string;
  upsert: "true" | "false";
};

export default async function read(props: ReadProps) {
  console.log("Running read: " + JSON.stringify(props));
}
