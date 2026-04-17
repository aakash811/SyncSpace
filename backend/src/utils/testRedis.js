import redis from "../config/redis.js";

const testRedis = async () => {
  await redis.set("test", "hello-syncspace");
  const value = await redis.get("test");

  console.log("Redis value:", value);
};

testRedis();