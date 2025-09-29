# Good-Base Configuration Guide

Good-Base uses a flexible configuration system that supports multiple
configuration sources with different priorities:

## Configuration Sources (in order of priority)

1. **Environment Variables** (highest priority)
2. **JSON Configuration File** (`./good-base.config.json`)
3. **Default Values** (lowest priority)## Configuration Sections

### Database Configuration

- `dataDirectory`: Directory where database files are stored
- `maxFileSize`: Maximum database file size in MB
- `enableBackups`: Whether to create automatic backups
- `backupDirectory`: Where to store backup files
- `backupInterval`: Backup frequency in hours

### Server Configuration

- `port`: HTTP server port
- `host`: Server hostname/interface
- `enableCors`: Enable CORS support
- `corsOrigins`: Allowed CORS origins (array)
- `requestTimeout`: Request timeout in seconds
- `maxBodySize`: Maximum request body size in MB

### Authentication Configuration

- `required`: Whether authentication is required
- `defaultToken`: Default auth token for development
- `validationMethod`: Token validation method (static|jwt|external)
- `jwtSecret`: JWT secret key (if using JWT)
- `externalEndpoint`: External validation URL (if using external)

### Index Configuration

- `defaultLevel`: Default index level (match|traverse|full)
- `optimizationThreshold`: Items before optimization kicks in
- `autoOptimize`: Enable automatic index optimization
- `enableCache`: Cache frequently used indexes
- `maxCacheSize`: Maximum cache size in MB

### Logging Configuration

- `level`: Log level (debug|info|warn|error)
- `enableFileLogging`: Write logs to files
- `logDirectory`: Log file directory
- `maxLogFileSize`: Maximum log file size in MB
- `logRetention`: Number of log files to keep
- `enableRequestLogging`: Log HTTP requests/responses

### CLI Configuration

- `historyFile`: Command history file path
- `historySize`: Maximum commands in history
- `enableColors`: Use colored terminal output
- `prompt`: CLI prompt text

## Configuration Formats

### JSON Format (`good-base.config.json`)

```json
{
  "database": {
    "dataDirectory": "./data",
    "defaultDatabase": "main"
  },
  "server": {
    "port": 5555,
    "host": "localhost"
  }
}
```

## Configuration Format

### JSON Configuration (`good-base.config.json`)

```json
{
  "database": {
    "dataDirectory": "./data"
  },
  "server": {
    "port": 5555,
    "host": "localhost"
  },
  "cli": {
    "authTimeoutMinutes": 30
  }
}
```

### Environment Variables

```bash
export GOOD_BASE_DATA_DIR="./data"
export GOOD_BASE_PORT=5555
export GOOD_BASE_HOST="localhost"
```

## CLI Commands

### Show Configuration

```bash
# Show all configuration
config

# Show specific section
config --key database

# Show specific value  
config --key database.dataDirectory
```

### Reload Configuration

```bash
config --action reload
```

## Getting Started

1. Copy `good-base.config.example.json` to `good-base.config.json`
2. Edit the configuration file to match your needs
3. Run `deno run --allow-read --allow-net --allow-env src/main.ts`
4. Use the `config` command in the CLI to verify your settings

## Environment Variable Reference

All configuration options can be overridden with environment variables:

- `GOOD_BASE_DATA_DIR` → `database.dataDirectory`
- `GOOD_BASE_BACKUP_DIR` → `database.backupDirectory`
- `GOOD_BASE_ENABLE_BACKUPS` → `database.enableBackups`
- `GOOD_BASE_PORT` → `server.port`
- `GOOD_BASE_HOST` → `server.host`
- `GOOD_BASE_CORS_ORIGINS` → `server.corsOrigins` (comma-separated)
- `GOOD_BASE_AUTH_REQUIRED` → `auth.required`
- `GOOD_BASE_AUTH_TOKEN` → `auth.defaultToken`
- `GOOD_BASE_JWT_SECRET` → `auth.jwtSecret`
- `GOOD_BASE_LOG_LEVEL` → `logging.level`
- `GOOD_BASE_LOG_DIR` → `logging.logDirectory`
- `GOOD_BASE_ENABLE_FILE_LOGGING` → `logging.enableFileLogging`

## Validation

The configuration system automatically validates settings and will show warnings
for:

- Missing required values
- Invalid port numbers
- Missing authentication tokens when required
- Invalid file paths
- Other common configuration issues

Use the `config` command to check if your configuration is valid.
