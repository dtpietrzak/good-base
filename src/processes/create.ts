type CreateProps = {
  index: string;
  key: string;
  value: string;
  auth: string;
  upsert?: string;
};

export default function create(props: CreateProps) {
  console.log("Running create: " + JSON.stringify(props));
  return { success: true, data: props };
}
