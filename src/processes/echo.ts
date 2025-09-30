type EchoProps = {
  text: string;
};

export default function echo(props: EchoProps) {
  return { success: true, data: { text: props.text } };
}
