export class CommandHistory {
  private history: string[] = [];
  private currentIndex: number = -1;
  private tempInput: string = "";
  private commandCount: number = 0; // Track total commands added since last cleanup

  constructor(
    private historyConfig: { 
      historyFilePath?: string; 
      historySize: number;
      persistentHistory: boolean;
    },
  ) {}

  async initialize(): Promise<void> {
    if (this.historyConfig.persistentHistory && this.historyConfig.historyFilePath) {
      await this.loadHistoryFromFile();
    }
  }

  async addCommand(command: string): Promise<void> {
    if (command.trim() && command !== this.history[this.history.length - 1]) {
      this.history.push(command);
      this.commandCount++;
      
      // Persist to file if configured and persistent history is enabled
      if (this.historyConfig.persistentHistory && this.historyConfig.historyFilePath) {
        await this.appendCommandToFile(command);
      }
      
      // Only truncate memory, not the file immediately
      if (this.history.length > this.historyConfig.historySize) {
        this.history = this.history.slice(-this.historyConfig.historySize);
      }
      
      // Check if we need to clean up the file periodically
      if (this.historyConfig.persistentHistory && this.historyConfig.historyFilePath && this.shouldCleanupFile()) {
        await this.cleanupHistoryFile();
      }
    }
    this.resetIndex();
  }

  private shouldCleanupFile(): boolean {
    // Only cleanup every 100 commands, and only if we've exceeded our target size
    // This prevents constant file rewrites while keeping file size reasonable
    const cleanupInterval = 100;
    return this.commandCount >= cleanupInterval && this.commandCount % cleanupInterval === 0;
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

  private async loadHistoryFromFile(): Promise<void> {
    try {
      const historyContent = await Deno.readTextFile(this.historyConfig.historyFilePath!);
      const lines = historyContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      // Load only the most recent commands up to historySize
      this.history = lines.slice(-this.historyConfig.historySize);
      // Reset command count since we just loaded from file
      this.commandCount = 0;
    } catch (error) {
      // If file doesn't exist or can't be read, start with empty history
      if (!(error instanceof Deno.errors.NotFound)) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`Warning: Could not load command history from ${this.historyConfig.historyFilePath}: ${errorMessage}`);
      }
      this.history = [];
      this.commandCount = 0;
    }
  }

  private async saveHistoryToFile(): Promise<void> {
    try {
      // Ensure the directory exists
      const historyDir = this.historyConfig.historyFilePath!.split('/').slice(0, -1).join('/');
      if (historyDir) {
        await Deno.mkdir(historyDir, { recursive: true });
      }
      
      // Write history to file
      const historyContent = this.history.join('\n') + '\n';
      await Deno.writeTextFile(this.historyConfig.historyFilePath!, historyContent);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`Warning: Could not save command history to ${this.historyConfig.historyFilePath}: ${errorMessage}`);
    }
  }

  private async appendCommandToFile(command: string): Promise<void> {
    try {
      // Ensure the directory exists
      const historyDir = this.historyConfig.historyFilePath!.split('/').slice(0, -1).join('/');
      if (historyDir) {
        await Deno.mkdir(historyDir, { recursive: true });
      }
      
      // Append command to file
      const file = await Deno.open(this.historyConfig.historyFilePath!, { 
        create: true, 
        append: true 
      });
      
      await file.write(new TextEncoder().encode(command + '\n'));
      file.close();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`Warning: Could not append command to history file ${this.historyConfig.historyFilePath}: ${errorMessage}`);
    }
  }

  private async cleanupHistoryFile(): Promise<void> {
    try {
      // Read the current file to get the total count
      const historyContent = await Deno.readTextFile(this.historyConfig.historyFilePath!);
      const allLines = historyContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      // Only rewrite if the file is actually larger than our limit
      if (allLines.length > this.historyConfig.historySize) {
        const trimmedHistory = allLines.slice(-this.historyConfig.historySize);
        const historyContent = trimmedHistory.join('\n') + '\n';
        await Deno.writeTextFile(this.historyConfig.historyFilePath!, historyContent);
        
        // Reset command count since we just cleaned up
        this.commandCount = 0;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`Warning: Could not cleanup command history file ${this.historyConfig.historyFilePath}: ${errorMessage}`);
    }
  }

  // Add method to get current history (useful for debugging)
  getHistory(): string[] {
    return [...this.history];
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
