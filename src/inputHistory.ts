export class CommandHistory {
  private history: string[] = [];
  private currentIndex: number = -1;
  private tempInput: string = "";

  addCommand(command: string): void {
    if (command.trim() && command !== this.history[this.history.length - 1]) {
      this.history.push(command);
    }
    this.resetIndex();
  }

  getPrevious(currentInput: string): string {
    if (this.currentIndex === -1) {
      this.tempInput = currentInput;
      this.currentIndex = this.history.length - 1;
    } else if (this.currentIndex > 0) {
      this.currentIndex--;
    }

    return this.currentIndex >= 0
      ? this.history[this.currentIndex]
      : currentInput;
  }

  getNext(currentInput: string): string {
    if (this.currentIndex === -1) {
      return currentInput;
    }

    this.currentIndex++;

    if (this.currentIndex >= this.history.length) {
      this.resetIndex();
      return this.tempInput;
    }

    return this.history[this.currentIndex];
  }

  private resetIndex(): void {
    this.currentIndex = -1;
    this.tempInput = "";
  }
}

export async function readInputWithHistory(
  history: CommandHistory,
): Promise<string> {
  // Enable raw mode to capture arrow keys
  Deno.stdin.setRaw(true);

  let input = "";
  let cursorPos = 0;

  try {
    while (true) {
      const buf = new Uint8Array(1);
      const n = await Deno.stdin.read(buf);

      if (n === null) break;

      const byte = buf[0];

      // Handle Enter key
      if (byte === 13) {
        await Deno.stdout.write(new TextEncoder().encode("\n"));
        break;
      }

      // Handle Ctrl+C
      if (byte === 3) {
        await Deno.stdout.write(new TextEncoder().encode("\n"));
        Deno.exit(0);
      }

      // Handle Backspace
      if (byte === 127 || byte === 8) {
        if (cursorPos > 0) {
          input = input.slice(0, cursorPos - 1) + input.slice(cursorPos);
          cursorPos--;
          await redrawLine(input, cursorPos);
        }
        continue;
      }

      // Handle Escape sequences (arrow keys)
      if (byte === 27) {
        const seq = new Uint8Array(2);
        await Deno.stdin.read(seq);

        if (seq[0] === 91) { // '[' character
          if (seq[1] === 65) { // Up arrow
            const prevCommand = history.getPrevious(input);
            input = prevCommand;
            cursorPos = input.length;
            await redrawLine(input, cursorPos);
          } else if (seq[1] === 66) { // Down arrow
            const nextCommand = history.getNext(input);
            input = nextCommand;
            cursorPos = input.length;
            await redrawLine(input, cursorPos);
          } else if (seq[1] === 67) { // Right arrow
            if (cursorPos < input.length) {
              cursorPos++;
              await Deno.stdout.write(new TextEncoder().encode("\x1b[C"));
            }
          } else if (seq[1] === 68) { // Left arrow
            if (cursorPos > 0) {
              cursorPos--;
              await Deno.stdout.write(new TextEncoder().encode("\x1b[D"));
            }
          }
        }
        continue;
      }

      // Handle printable characters
      if (byte >= 32 && byte <= 126) {
        const char = String.fromCharCode(byte);
        input = input.slice(0, cursorPos) + char + input.slice(cursorPos);
        cursorPos++;
        await redrawLine(input, cursorPos);
      }
    }
  } finally {
    // Disable raw mode
    Deno.stdin.setRaw(false);
  }

  return input.trim();
}

async function redrawLine(input: string, cursorPos: number): Promise<void> {
  // Clear line and redraw
  await Deno.stdout.write(new TextEncoder().encode("\r\x1b[K"));
  await Deno.stdout.write(new TextEncoder().encode("good-base-> " + input));

  // Move cursor to correct position
  const targetPos = "good-base-> ".length + cursorPos;
  const currentPos = "good-base-> ".length + input.length;
  const diff = currentPos - targetPos;

  if (diff > 0) {
    await Deno.stdout.write(new TextEncoder().encode(`\x1b[${diff}D`));
  }
}
