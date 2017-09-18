import java.util.concurrent.Executors;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

/**
 * @Auther: yangchun
 * @Date: 2017-9-8 11:37
 */

public class JedisTest {

  public static Integer count = 0;

  //@Test
  public static void main(String[] args) {
    //JedisPoolConfig config = new JedisPoolConfig();
    //config.setMaxIdle(20);
    //config.setMaxTotal(200);
    //JedisPool pool = new JedisPool(config, "localhost", 6379);
    //
    //Jedis jedis = pool.getResource();
    //jedis.set("xx", "xxx");

    Executors.newSingleThreadExecutor().execute(new Runnable() {
      @Override
      public void run() {
        JedisPoolConfig config = new JedisPoolConfig();
        config.setMaxIdle(20);
        config.setMaxTotal(200);
        JedisPool pool = new JedisPool(config, "localhost", 6379);

        Jedis jedis = pool.getResource();
        jedis.set("xx", "xxx");
        long start = System.currentTimeMillis();
        int i = 0;
        while (true) {
          String data = jedis.get("xx");
          //System.out.println(++count);
          i++;
        }

      }
    });
  }
}
