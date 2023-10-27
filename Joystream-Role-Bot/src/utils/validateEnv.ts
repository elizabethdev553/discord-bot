export const validateEnv = () => {
  if (!process.env.SERVER_TOKEN) {
    console.warn("Missing Discord bot token.");
    return false;
  }
  return true;
};
