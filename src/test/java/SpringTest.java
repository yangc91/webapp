import java.util.Date;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.ResponseBody;
import org.apache.commons.lang3.time.DateFormatUtils;

/**
 * @Auther: yangchun
 * @Date: 2017-7-28 17:45
 */
public class SpringTest {
  public static void main(String[] args) throws Exception {
    Date date = new Date(1506480784589L);
    String time = DateFormatUtils.format(date, "yyyy-MM-dd HH:mm:ss");
    System.out.println(time);
    for (int i = 0; i< 1; i++) {

      OkHttpClient client = new OkHttpClient();

      // Create request for remote resource.
      Request request = new Request.Builder()
          .url("http://club.m.autohome.com.cn/bbs/thread-c-2123-67431829-1.html?pvareaid=101967")
          .build();

      // Execute the request and retrieve the response.
        Response response = client.newCall(request).execute();
        // Deserialize HTTP response to concrete type.
        ResponseBody body = response.body();

      System.out.println(body.string());
      Thread.sleep(1000);
    }
  }
}
