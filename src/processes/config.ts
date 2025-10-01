import { getConfig } from "../config/state.ts";

type ConfigProps = {
  key?: string;
};

export default function config(props: ConfigProps) {
  const { key } = props;

  const config = getConfig();
  if (key) {
    // Show specific configuration key
    const keyPath = key.split(".");
    // deno-lint-ignore no-explicit-any
    let current: any = config;

    for (const part of keyPath) {
      if (current && typeof current === "object" && part in current) {
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
