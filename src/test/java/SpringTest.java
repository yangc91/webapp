import java.util.Date;
import org.apache.commons.lang3.time.DateFormatUtils;

/**
 * @Auther: yangchun
 * @Date: 2017-7-28 17:45
 */
public class SpringTest {
  public static void main(String[] args) {
    Date date = new Date(1506480784589L);
    String time = DateFormatUtils.format(date, "yyyy-MM-dd HH:mm:ss");
    System.out.println(time);
  }
}
