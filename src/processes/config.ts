import { getConfig, reloadConfig } from "../config/index.ts";

type ConfigProps = {
  action?: string;
  key?: string;
  value?: string;
};

export default async function config(props: ConfigProps) {
  const { action = "show", key } = props;

  switch (action.toLowerCase()) {
    case "show": {
      const config = getConfig();
      if (key) {
        // Show specific configuration key
        const keyPath = key.split('.');
        // deno-lint-ignore no-explicit-any
        let current: any = config;
        
        for (const part of keyPath) {
          if (current && typeof current === 'object' && part in current) {
            current = current[part];
          } else {
            return {
              success: false,
              data: `Configuration key '${key}' not found`,
            };
          }
        }
        
        return {
          success: true,
          data: {
            key,
            value: current,
          },
        };
      } else {
        // Show all configuration
        return {
          success: true,
          data: config,
        };
      }
    }

    case "reload": {
      try {
        const newConfig = await reloadConfig();
        return {
          success: true,
          data: {
            message: "Configuration reloaded successfully",
            config: newConfig,
          },
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          data: `Failed to reload configuration: ${errorMessage}`,
        };
      }
    }

    default: {
      return {
        success: false,
        data: `Unknown action '${action}'. Available actions: show, reload`,
      };
    }
  }
}