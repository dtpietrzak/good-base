# Directory Configuration

Good-base now uses OS-appropriate directory conventions for storing data,
configuration, logs, and other files.

## Directory Structure

The application creates the following directory structure:

```text
{base}/
├── data/           # Database files
├── config/         # Configuration files (like command history)
├── logs/           # Log files (when file logging is enabled)
├── backups/        # Database backups
└── cache/          # Cached data and temporary files
```

## OS-Specific Locations

### Production Mode (NODE_ENV=production)

- **macOS**: `~/Library/Application Support/good-base/`
- **Linux**: `~/.local/share/good-base/` (respects `$XDG_DATA_HOME` if set)
- **Windows**: `%APPDATA%\good-base\`

### Development Mode (NODE_ENV≠production)

- **All platforms**: `./tmp/good-base/`

This keeps development data separate and easily removable.

## Environment Variable Override

You can override the base directory by setting the `DATA_DIR` environment
variable:

```bash
# Use a custom directory
export DATA_DIR="/path/to/custom/good-base"

# Use a specific directory for this session
DATA_DIR="/tmp/test-db" deno run src/main.ts
```

## Automatic Directory Creation

All necessary directories are automatically created when the configuration is
loaded. You don't need to manually create them.

## Examples

### Development

```bash
# Development mode uses ./tmp/good-base/
deno run src/main.ts

# Files will be in:
# ./tmp/good-base/data/          (databases)
# ./tmp/good-base/config/        (CLI history)
# ./tmp/good-base/logs/          (log files)
```

### Production

```bash
# Production mode uses OS conventions  
NODE_ENV=production deno run src/main.ts

# On macOS, files will be in:
# ~/Library/Application Support/good-base/data/
# ~/Library/Application Support/good-base/config/
# ~/Library/Application Support/good-base/logs/
```

### Custom Directory

```bash
# Use completely custom location
DATA_DIR="/var/lib/good-base" deno run src/main.ts

# Files will be in:
# /var/lib/good-base/data/
# /var/lib/good-base/config/
# /var/lib/good-base/logs/
```

## Configuration

The directory setup is handled automatically by the configuration system. You
can customize it in `good-base.config.ts`:

```typescript
import { getAppDirectories } from "./src/config/directories.ts";

// Get OS-appropriate directories
const dirs = getAppDirectories("good-base");

const config = {
  database: {
    dataDirectory: dirs.data, // OS-appropriate data directory
    backupDirectory: dirs.backups, // OS-appropriate backup directory
  },
  logging: {
    logDirectory: dirs.logs, // OS-appropriate log directory
  },
  cli: {
    historyFile: `${dirs.config}/.good_history`, // OS-appropriate config directory
  },
};
```
