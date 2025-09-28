type InsertProps = {
  index: string;
  kay: string;
  auth: string;
};

export default async function insert(props: InsertProps) {
  console.log("Running insert: " + JSON.stringify(props));
}
