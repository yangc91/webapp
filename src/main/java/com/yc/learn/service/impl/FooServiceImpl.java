package com.yc.learn.service.impl;

import com.yc.learn.service.FooService;
import org.springframework.stereotype.Service;

/**
 * @Auther: yangchun
 * @Date: 2017-8-24 11:25
 */
@Service("fooService")
public class FooServiceImpl implements FooService {

  public FooServiceImpl() {
    System.out.println("FooServiceImpl init……");
  }
  public void test() {
    System.out.println("==========");
  }
}
