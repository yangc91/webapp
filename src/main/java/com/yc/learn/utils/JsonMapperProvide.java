package com.yc.learn.utils;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.text.SimpleDateFormat;

public class JsonMapperProvide {

  private static ObjectMapper alwaysMapper;
  private static ObjectMapper nonEmptyMapper;
  private static ObjectMapper nonNullMapper;
  private static ObjectMapper nonDefaultMapper;

  public static ObjectMapper alwaysMapper() {
    return alwaysMapper;
  }

  public static ObjectMapper nonEmptyMapper() {
    return nonEmptyMapper;
  }

  public static ObjectMapper nonNullMapper() {
    return nonNullMapper;
  }

  public static ObjectMapper nonDefaultMapper() {
    return nonDefaultMapper;
  }

  static {
    alwaysMapper = builtJsonMapper(JsonInclude.Include.ALWAYS);
    nonEmptyMapper = builtJsonMapper(JsonInclude.Include.NON_EMPTY);
    nonNullMapper = builtJsonMapper(JsonInclude.Include.NON_NULL);
    nonDefaultMapper = builtJsonMapper(JsonInclude.Include.NON_DEFAULT);
  }

  private static ObjectMapper builtJsonMapper(JsonInclude.Include include) {
    ObjectMapper mapper = new ObjectMapper();
    if(include != null) {
      mapper.setSerializationInclusion(include);
    }

    mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
    mapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
    mapper.enable(DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT);
    mapper.getFactory().enable(JsonParser.Feature.ALLOW_COMMENTS);
    mapper.getFactory().enable(JsonParser.Feature.ALLOW_SINGLE_QUOTES);

    return mapper;
  }

}
