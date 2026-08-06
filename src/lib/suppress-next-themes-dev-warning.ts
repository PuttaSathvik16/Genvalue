/**
 * next-themes injects an inline script for theme flash prevention.
 * React 19 dev mode warns about script tags in component trees - harmless here.
 */
if (process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return;
    }
    originalError.apply(console, args as Parameters<typeof console.error>);
  };
}
