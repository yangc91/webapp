package com.yc.learn.xss;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import java.io.IOException;
import org.springframework.web.util.HtmlUtils;

/**
 * @author: yc
 * @date: 2017-12-15.
 */
public class DefaultJsonSerializer extends StdSerializer<String> {

  public DefaultJsonSerializer() {
    this(null);
  }

  public DefaultJsonSerializer(Class<String> t) {
    super(t);
  }

  @Override
  public void serialize(String value, JsonGenerator gen, SerializerProvider serializers)
      throws IOException {
    String safe = HtmlUtils.htmlEscape(value, "utf-8");
    gen.writeString(safe);
  }
}
