// Completely bypass Firebase - create mock exports
console.log("Running in bypass mode - Firebase authentication disabled");

// Create mock auth object to prevent initialization errors
const auth = null;
const app = undefined;

export { auth };
export default app;
