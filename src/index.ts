import { login } from "./auth";

async function main() {
  const response = await login("kevin", "1234");

  console.log(response);
}

main();