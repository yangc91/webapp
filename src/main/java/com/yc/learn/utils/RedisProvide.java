package com.yc.learn.utils;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

/**
 * @Auther: yangchun
 * @Date: 2017-9-8 15:32
 */
public class RedisProvide {

  private JedisPool jedisPool;

 public RedisProvide(JedisPool jedisPool) {
    this.jedisPool = jedisPool;
 }

  public void get() {
   Jedis jedis = jedisPool.getResource();
    jedis.get("xx");
    jedis.close();
  }
}
