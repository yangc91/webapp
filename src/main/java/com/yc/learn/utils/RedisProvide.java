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

  public static void main(String[] args) {
    JedisPoolConfig config = new JedisPoolConfig();
    //config.setMaxIdle(Integer.valueOf(maxIdle));
    //config.setMaxTotal(Integer.valueOf(maxTotal));

    JedisPool pool = new JedisPool(config, "11.12.108.83", Integer.valueOf("6379"), Integer.valueOf("6000"));
    Jedis jedis = pool.getResource();
    String info = jedis.hget("uaas_login_info_unique","020022");
    System.out.println(info);
  }
}
