package com.yc.learn.utils;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @Date: 2017-8-28 16:06
 */
public class FileNameChange {

  public static Logger logger = LoggerFactory.getLogger(FileNameChange.class);

  public static void main(String[] args) throws Exception {
    File rootFile = new File("./");
    //recursionCopyDir(rootFile);
    recursionDeleteDir(rootFile);
  }

  /**
   * 递归复制文件
   * @param rooTfile
   */
  public static void recursionCopyDir(File rooTfile) {
    File[] listFiles = rooTfile.listFiles();

    for (File file : listFiles) {
      if (file.isFile()) {
        copyFile(file);
      } else if (file.isDirectory()) {
        recursionCopyDir(file);
      }
    }
  }

  /**
   * 递归删除文件
   * @param rooTfile
   */
  public static void recursionDeleteDir(File rooTfile) {
    File[] listFiles = rooTfile.listFiles();

    for (File file : listFiles) {
      if (file.isFile()) {
        deleteFile(file);
      } else if (file.isDirectory()) {
        recursionDeleteDir(file);
      }
    }
  }

  /**
   * 复制文件：源文件 ---> diy file
   * @param src
   */
  public static void copyFile(File src) {
    try {
      FileInputStream in = new FileInputStream(src);
      String name = src.getName();
      Integer spe = name.lastIndexOf(".");
      if (spe != -1) {
        String prefix = name.substring(0, spe);
        String suffix = name.substring(spe + 1, name.length());
        try {
          DE_FILE_TYPE type = DE_FILE_TYPE.valueOf(suffix);
          //
          File dst = new File(src.getParent() + "/" + prefix + type.getDst());
          if (!dst.exists()) {
            dst.createNewFile();
          }
          FileOutputStream out = new FileOutputStream(dst);
          byte[] cache = new byte[1024];
          int nRead = 0;
          while ((nRead = in.read(cache)) != -1) {
            out.write(cache, 0, nRead);
            out.flush();
          }
          out.close();
          in.close();
          System.out.println("=====" + name);
        } catch (IllegalArgumentException e) {
          logger.error("===== no support file type: {}", name);
        }
      }
    } catch (Exception e) {
      logger.error("===== cope file error: {}", src.getName());
    }
  }

  /**
   * 删除diy文件
   * @param src
   */
  public static void deleteFile(File src) {
    try {
      String name = src.getName();
      Integer spe = name.lastIndexOf(".");
      if (spe != -1) {
        String prefix = name.substring(0, spe);
        String suffix = name.substring(spe + 1, name.length());
        try {
          EN_FILE_TYPE type = EN_FILE_TYPE.valueOf(suffix);
          if (src.exists()) {
            src.delete();
          }
          System.out.println("delete =====" + name);
        } catch (IllegalArgumentException e) {
          logger.error("===== no support file type: {}", name);
        }
      }
    } catch (Exception e) {
      logger.error("===== delete file error: {}", src.getName());
    }
  }

  /**
   * 转化
   */
  public enum DE_FILE_TYPE {

    java("java", ".javaDiy"),

    xml("xml", ".xmlDiy"),

    properties("properties", ".propertiesDiy"),

    jsp("jsp", ".jspDiy"),

    html("html", ".htmlDiy"),

    css("css", ".cssDiy"),

    js("js", ".jsDiy"),

    txt("txt", ".txtDiy"),

    conf("conf", ".confDiy");

    public String src;

    public String dst;

    private DE_FILE_TYPE(String src, String dst) {
      this.src = src;
      this.dst = dst;
    }

    public String getSrc() {
      return src;
    }

    public void setSrc(String src) {
      this.src = src;
    }

    public String getDst() {
      return dst;
    }

    public void setDst(String dst) {
      this.dst = dst;
    }
  }

  /**
   * 反转
   */
  public enum EN_FILE_TYPE {

    javaDiy("javaDiy", ".java"),

    xmlDiy("xmlDiy", ".xml"),

    proDiy("proDiy", ".properties"),

    jspDiy("jspDiy", ".jsp"),

    htmlDiy("htmlDiy", ".html"),

    cssDiy("cssDiy", ".css"),

    jsDiy("jsDiy", ".js"),

    txtDiy("txtDiy", ".txt"),

    confDiy("confDiy", ".conf");

    public String src;

    public String dst;

    private EN_FILE_TYPE(String src, String dst) {
      this.src = src;
      this.dst = dst;
    }

    public String getSrc() {
      return src;
    }

    public void setSrc(String src) {
      this.src = src;
    }

    public String getDst() {
      return dst;
    }

    public void setDst(String dst) {
      this.dst = dst;
    }
  }
}
