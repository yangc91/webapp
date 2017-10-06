package jwt;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.yc.learn.utils.JsonMapperProvide;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.jwt.Jwt;
import org.springframework.security.jwt.JwtHelper;
import org.springframework.security.jwt.crypto.sign.MacSigner;

import static org.springframework.security.jwt.codec.Codecs.utf8Decode;
import static org.springframework.security.jwt.codec.Codecs.utf8Encode;

/**
 * @Auther: yangchun
 * @Date: 2017-9-12 10:16
 */
public class JwtTest {

  static final MacSigner hmacsha256 = new MacSigner(utf8Encode("uuidtest123456qwert"));

  public static void main(String[] args) throws JsonProcessingException {
    UsernamePasswordAuthenticationToken
        authenticationToken = new UsernamePasswordAuthenticationToken("aaa", "dddd");

    Jwt jwt = JwtHelper.encode(JsonMapperProvide.alwaysMapper().writeValueAsString(authenticationToken), hmacsha256);

    String token = utf8Decode(jwt.bytes());

    Jwt jwtTest = JwtHelper.decodeAndVerify(token, hmacsha256);

    System.out.println("========");
  }
}
