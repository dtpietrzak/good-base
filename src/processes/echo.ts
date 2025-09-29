type EchoProps = {
  text: string;
};

export default function echo(props: EchoProps) {
  console.log(props.text);
  return { success: true, data: { text: props.text } };
}
