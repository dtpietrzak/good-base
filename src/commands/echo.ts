type EchoProps = {
  text: string;
};

export default function echo(props: EchoProps) {
  console.log(props.text);
}
