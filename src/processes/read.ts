type ReadProps = {
  index: string;
  key: string;
  auth: string;
};

export default function read(props: ReadProps) {
  console.log("Running read: " + JSON.stringify(props));
  return { success: true, data: props };
}
